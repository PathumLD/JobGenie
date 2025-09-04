import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { 
  BusinessRegistrationAnalysisRequest,
  BusinessRegistrationAnalysisResponse,
  BusinessRegistrationAnalysisError,
  BusinessRegistrationData,
  CompanyDataComparison,
  BusinessRegistrationAnalysisResult
} from '@/types/business-registration-analysis';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  exp?: number;
  iat?: number;
}

const getBusinessRegistrationAnalysisPrompt = (companyData: any) => `
Analyze this business registration document and extract the following information. Then compare it with the provided company profile data to verify accuracy.

EXTRACT the following data from the document and return STRICT JSON matching this EXACT structure:

{
  "company_name": "string",
  "business_registration_number": "string", 
  "registration_date": "YYYY-MM-DD",
  "business_type": "string",
  "industry": "string",
  "registered_address": "string",
  "business_activities": ["string"],
  "authorized_capital": "string|null",
  "paid_up_capital": "string|null",
  "directors": [
    {
      "name": "string",
      "designation": "string", 
      "address": "string|null"
    }
  ],
  "shareholders": [
    {
      "name": "string",
      "share_percentage": "string|null",
      "share_value": "string|null"
    }
  ],
  "company_status": "string",
  "expiry_date": "YYYY-MM-DD|null",
  "issuing_authority": "string",
  "document_type": "string",
  "document_verification_status": "verified|unverified|expired|invalid"
}

COMPANY PROFILE DATA TO COMPARE:
- Company Name: ${companyData.name || 'Not provided'}
- Business Registration Number: ${companyData.business_registration_no || 'Not provided'}
- Industry: ${companyData.industry || 'Not provided'}
- Company Type: ${companyData.company_type || 'Not provided'}
- Registered Address: ${companyData.registered_address || 'Not provided'}
- Founded Year: ${companyData.founded_year || 'Not provided'}

ANALYSIS RULES:
1. Extract ALL visible text from the document
2. For dates, convert to YYYY-MM-DD format
3. For monetary values, preserve original format with currency
4. For company status, check if active, dissolved, etc.
5. Verify document authenticity indicators (watermarks, signatures, official stamps)
6. Compare extracted data with provided company profile
7. Identify any discrepancies or missing information
8. Assess document quality and completeness
9. Return ONLY the JSON object with NO additional text
10. If information is not found, use null
11. For business activities, extract all mentioned activities as an array
12. For directors and shareholders, extract all individuals mentioned

VERIFICATION CRITERIA:
- Company name should match exactly (case-insensitive)
- Registration number should match exactly
- Industry should be consistent
- Address should be similar (allowing for formatting differences)
- Founded year should be consistent with registration date
- Document should appear authentic and official
`;

const compareCompanyData = (
  extractedData: BusinessRegistrationData, 
  companyProfile: any
): CompanyDataComparison[] => {
  const comparisons: CompanyDataComparison[] = [];

  // Company Name Comparison
  comparisons.push({
    field: 'company_name',
    document_value: extractedData.company_name,
    profile_value: companyProfile.name,
    match_status: extractedData.company_name?.toLowerCase() === companyProfile.name?.toLowerCase() ? 'match' : 'mismatch',
    confidence_score: extractedData.company_name?.toLowerCase() === companyProfile.name?.toLowerCase() ? 100 : 0,
    notes: extractedData.company_name?.toLowerCase() === companyProfile.name?.toLowerCase() ? 'Names match exactly' : 'Names do not match'
  });

  // Business Registration Number Comparison
  comparisons.push({
    field: 'business_registration_number',
    document_value: extractedData.business_registration_number,
    profile_value: companyProfile.business_registration_no,
    match_status: extractedData.business_registration_number === companyProfile.business_registration_no ? 'match' : 'mismatch',
    confidence_score: extractedData.business_registration_number === companyProfile.business_registration_no ? 100 : 0,
    notes: extractedData.business_registration_number === companyProfile.business_registration_no ? 'Registration numbers match' : 'Registration numbers do not match'
  });

  // Industry Comparison
  comparisons.push({
    field: 'industry',
    document_value: extractedData.industry,
    profile_value: companyProfile.industry,
    match_status: extractedData.industry?.toLowerCase() === companyProfile.industry?.toLowerCase() ? 'match' : 'mismatch',
    confidence_score: extractedData.industry?.toLowerCase() === companyProfile.industry?.toLowerCase() ? 100 : 85,
    notes: extractedData.industry?.toLowerCase() === companyProfile.industry?.toLowerCase() ? 'Industries match' : 'Industries may differ due to categorization'
  });

  // Address Comparison (fuzzy matching)
  const addressMatch = extractedData.registered_address && companyProfile.registered_address 
    ? extractedData.registered_address.toLowerCase().includes(companyProfile.registered_address.toLowerCase()) ||
      companyProfile.registered_address.toLowerCase().includes(extractedData.registered_address.toLowerCase())
    : false;
  
  comparisons.push({
    field: 'registered_address',
    document_value: extractedData.registered_address,
    profile_value: companyProfile.registered_address,
    match_status: addressMatch ? 'match' : 'mismatch',
    confidence_score: addressMatch ? 90 : 0,
    notes: addressMatch ? 'Addresses are similar' : 'Addresses do not match'
  });

  // Founded Year Comparison
  const documentYear = extractedData.registration_date ? new Date(extractedData.registration_date).getFullYear() : null;
  const profileYear = companyProfile.founded_year;
  
  comparisons.push({
    field: 'founded_year',
    document_value: documentYear?.toString() || null,
    profile_value: profileYear?.toString() || null,
    match_status: documentYear === profileYear ? 'match' : 'mismatch',
    confidence_score: documentYear === profileYear ? 100 : 0,
    notes: documentYear === profileYear ? 'Years match' : 'Years do not match'
  });

  return comparisons;
};

const generateAnalysisSummary = (
  extractedData: BusinessRegistrationData,
  comparisons: CompanyDataComparison[]
): BusinessRegistrationAnalysisResult => {
  const matchCount = comparisons.filter(c => c.match_status === 'match').length;
  const totalComparisons = comparisons.length;
  const overallConfidence = Math.round((matchCount / totalComparisons) * 100);

  const discrepancies = comparisons
    .filter(c => c.match_status === 'mismatch')
    .map(c => ({
      field: c.field,
      issue: `${c.field} does not match between document and profile`,
      severity: c.field === 'business_registration_number' ? 'high' as const : 
                c.field === 'company_name' ? 'high' as const : 'medium' as const,
      suggested_action: `Verify ${c.field} in company profile`
    }));

  const recommendations: string[] = [];
  
  if (overallConfidence < 70) {
    recommendations.push('Manual review required due to multiple discrepancies');
  }
  
  if (extractedData.document_verification_status === 'expired') {
    recommendations.push('Document appears to be expired - request updated document');
  }
  
  if (extractedData.document_verification_status === 'invalid') {
    recommendations.push('Document authenticity is questionable - request verification');
  }

  if (discrepancies.length > 0) {
    recommendations.push('Address discrepancies with company profile data');
  }

  let overallStatus: 'verified' | 'needs_review' | 'failed';
  if (overallConfidence >= 90 && extractedData.document_verification_status === 'verified') {
    overallStatus = 'verified';
  } else if (overallConfidence >= 60) {
    overallStatus = 'needs_review';
  } else {
    overallStatus = 'failed';
  }

  return {
    success: true,
    extracted_data: extractedData,
    comparison_results: comparisons,
    overall_verification_status: overallStatus,
    confidence_score: overallConfidence,
    analysis_summary: `Document analysis completed with ${overallConfidence}% confidence. ${matchCount}/${totalComparisons} fields match the company profile.`,
    recommendations,
    discrepancies,
    document_quality: {
      clarity: extractedData.company_name && extractedData.business_registration_number ? 'good' : 'fair',
      completeness: extractedData.directors.length > 0 && extractedData.business_activities.length > 0 ? 'complete' : 'partial',
      authenticity_indicators: extractedData.document_verification_status === 'verified' ? ['Official format', 'Registration number present'] : ['Requires verification']
    }
  };
};

export async function POST(request: NextRequest): Promise<NextResponse<BusinessRegistrationAnalysisResponse | BusinessRegistrationAnalysisError>> {
  try {
    console.log('🔄 Business Registration Analysis API called');

    // 1. Authenticate user
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = verifyToken(token) as JWTPayload;
      if (!payload) {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'mis') {
      return NextResponse.json(
        { error: 'Access denied. Only MIS users can analyze business registration documents.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body: BusinessRegistrationAnalysisRequest = await request.json();
    const { companyId, documentUrl, forceReanalysis = false } = body;

    if (!companyId || !documentUrl) {
      return NextResponse.json(
        { error: 'Company ID and document URL are required' },
        { status: 400 }
      );
    }

    // 3. Validate company ID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    // 4. Get company profile data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        industry: true,
        company_type: true,
        business_registration_no: true,
        registered_address: true,
        founded_year: true,
        business_registration_url: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // 5. Check if document URL matches company's registration document
    if (company.business_registration_url !== documentUrl) {
      return NextResponse.json(
        { error: 'Document URL does not match company registration document' },
        { status: 400 }
      );
    }

    console.log('📄 Analyzing business registration document for company:', company.name);

    // 6. Process document with Gemini AI
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 7. Fetch document from URL and convert to base64
    const documentResponse = await fetch(documentUrl);
    if (!documentResponse.ok) {
      throw new Error('Failed to fetch document from URL');
    }

    const documentBuffer = await documentResponse.arrayBuffer();
    const base64Data = Buffer.from(documentBuffer).toString('base64');
    
    // 8. Analyze document with Gemini
    const result = await model.generateContent([
      { text: getBusinessRegistrationAnalysisPrompt(company) },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 AI analysis response received, length:', text.length);
    
    // 9. Parse the JSON response
    let extractedData: BusinessRegistrationData;
    try {
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      extractedData = JSON.parse(cleanedText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', text);
      throw new Error('Invalid AI response format');
    }

    // 10. Compare extracted data with company profile
    const comparisons = compareCompanyData(extractedData, company);
    
    // 11. Generate analysis result
    const analysisResult = generateAnalysisSummary(extractedData, comparisons);

    console.log('✅ Business registration analysis completed successfully');

    return NextResponse.json({
      success: true,
      result: analysisResult,
      message: 'Business registration document analyzed successfully'
    });

  } catch (error) {
    console.error('❌ Business registration analysis error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Analysis failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
