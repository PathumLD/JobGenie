import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

interface DocumentAnalysisRequest {
  companyName: string;
  businessRegistrationNo: string;
  documentFile: File;
}

interface DocumentAnalysisResponse {
  success: boolean;
  extractedData?: {
    company_name: string;
    business_registration_number: string;
  };
  validationResult?: {
    companyNameMatch: boolean;
    registrationNoMatch: boolean;
    canProceed: boolean;
    mismatches: string[];
  };
  error?: string;
  details?: string;
}

const getDocumentAnalysisPrompt = (companyName: string, businessRegistrationNo: string) => `
Analyze this business registration document and extract the company name and business registration number.

EXTRACT the following data from the document and return STRICT JSON matching this EXACT structure:

{
  "company_name": "string",
  "business_registration_number": "string"
}

COMPANY DATA TO COMPARE:
- Expected Company Name: ${companyName}
- Expected Business Registration Number: ${businessRegistrationNo}

ANALYSIS RULES:
1. Extract ALL visible text from the document
2. Look for the company name - it may appear as "Company Name", "Business Name", "Entity Name", or similar
3. Look for the business registration number - it may appear as "Registration Number", "Business Registration No", "Company Registration No", "BRN", or similar
4. For company name, use the exact name as it appears in the document (preserve original formatting)
5. For business registration number, extract the complete registration number including any prefixes or suffixes
6. Search through the entire document thoroughly - information may be in headers, body text, or tables
7. Return ONLY the JSON object with NO additional text
8. If information is not found after thorough search, use null

VERIFICATION CRITERIA:
- Company name should match exactly (case-insensitive)
- Registration number should match exactly

IMPORTANT: Be thorough in your search. Business registration documents typically contain this information prominently. Look in all sections of the document.
`;

export async function POST(request: NextRequest): Promise<NextResponse<DocumentAnalysisResponse>> {
  try {
    console.log('🔄 Document Analysis API called for employer registration');

    // Parse multipart form data
    const formData = await request.formData();
    
    const companyName = formData.get('companyName') as string;
    const businessRegistrationNo = formData.get('businessRegistrationNo') as string;
    const documentFile = formData.get('documentFile') as File;

    if (!companyName || !businessRegistrationNo || !documentFile) {
      return NextResponse.json(
        { success: false, error: 'Company name, business registration number, and document file are required' },
        { status: 400 }
      );
    }

    console.log('📄 Analyzing document for company:', companyName);

    // Process document with Gemini AI
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const arrayBuffer = await documentFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    // Determine MIME type
    let mimeType = 'application/pdf';
    if (documentFile.type) {
      mimeType = documentFile.type;
    } else {
      const fileName = documentFile.name.toLowerCase();
      if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.doc')) {
        mimeType = 'application/msword';
      } else if (fileName.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    }
    
    console.log('📄 File details:', {
      name: documentFile.name,
      type: documentFile.type,
      size: documentFile.size,
      detectedMimeType: mimeType
    });
    
    // Analyze document with Gemini
    const result = await model.generateContent([
      { text: getDocumentAnalysisPrompt(companyName, businessRegistrationNo) },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 AI analysis response received, length:', text.length);
    console.log('🤖 Raw AI response:', text);
    
    // Parse the JSON response
    let extractedData: { company_name: string; business_registration_number: string };
    try {
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      extractedData = JSON.parse(cleanedText);
      console.log('✅ JSON parsed successfully');
      console.log('📊 Extracted data:', extractedData);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', text);
      return NextResponse.json(
        { success: false, error: 'Invalid AI response format', details: 'Failed to parse document analysis results' },
        { status: 500 }
      );
    }

    // Validate extracted data against form data
    const companyNameMatch = Boolean(extractedData.company_name && extractedData.company_name.toLowerCase() === companyName.toLowerCase());
    const registrationNoMatch = Boolean(extractedData.business_registration_number && extractedData.business_registration_number === businessRegistrationNo);
    
    const mismatches: string[] = [];
    if (!companyNameMatch) {
      if (extractedData.company_name === null || extractedData.company_name === undefined) {
        mismatches.push(`Company name not found in document. Please ensure the document is a valid business registration certificate.`);
      } else {
        mismatches.push(`Company name mismatch: Document shows "${extractedData.company_name}" but form shows "${companyName}"`);
      }
    }
    if (!registrationNoMatch) {
      if (extractedData.business_registration_number === null || extractedData.business_registration_number === undefined) {
        mismatches.push(`Business registration number not found in document. Please ensure the document is a valid business registration certificate.`);
      } else {
        mismatches.push(`Registration number mismatch: Document shows "${extractedData.business_registration_number}" but form shows "${businessRegistrationNo}"`);
      }
    }

    const canProceed = companyNameMatch && registrationNoMatch;

    console.log('🔍 Validation results:', {
      companyNameMatch,
      registrationNoMatch,
      canProceed,
      extractedCompanyName: extractedData.company_name,
      extractedRegistrationNo: extractedData.business_registration_number,
      expectedCompanyName: companyName,
      expectedRegistrationNo: businessRegistrationNo
    });

    console.log('✅ Document analysis completed successfully');

    return NextResponse.json({
      success: true,
      extractedData,
      validationResult: {
        companyNameMatch,
        registrationNoMatch,
        canProceed,
        mismatches
      }
    });

  } catch (error) {
    console.error('❌ Document analysis error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: 'Analysis failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
