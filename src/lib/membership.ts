import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique membership number based on user ID + 1000
 * @param userId - The user's UUID
 * @returns string - The unique membership number
 */
export function generateMembershipNumberFromUserId(userId: string): string {
  try {
    // Remove hyphens and take first 8 characters of UUID
    const cleanUserId = userId.replace(/-/g, '').substring(0, 8);
    
    // Convert to decimal and add 1000
    const decimalValue = parseInt(cleanUserId, 16);
    const membershipNumber = decimalValue + 1000;
    
    return membershipNumber.toString();
  } catch (error) {
    console.error('Error generating membership number from user ID:', error);
    // Fallback: use timestamp + random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `T${timestamp}${random}`;
  }
}

/**
 * Validates if a membership number is unique
 * @param membershipNo - The membership number to validate
 * @returns Promise<boolean> - True if unique, false if already exists
 */
export async function isMembershipNumberUnique(membershipNo: string): Promise<boolean> {
  try {
    const existingCandidate = await prisma.candidate.findFirst({
      where: { membership_no: membershipNo }
    });
    return !existingCandidate;
  } catch (error) {
    console.error('Error checking membership number uniqueness:', error);
    return false;
  }
}

/**
 * Formats a membership number with proper padding
 * @param number - The number to format
 * @returns string - Formatted membership number
 */
export function formatMembershipNumber(number: string | number): string {
  return number.toString().padStart(3, '0');
}

/**
 * Validates membership number format
 * @param membershipNo - The membership number to validate
 * @returns boolean - True if valid format, false otherwise
 */
export function isValidMembershipNumberFormat(membershipNo: string): boolean {
  // Allow alphanumeric membership numbers
  // You can customize this regex based on your requirements
  const membershipNumberRegex = /^[A-Z0-9]+$/i;
  return membershipNumberRegex.test(membershipNo) && membershipNo.length >= 1;
}
