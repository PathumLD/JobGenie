import nodemailer from 'nodemailer';

// Email configuration interface
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create transporter for sending emails
export const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  return nodemailer.createTransport(config);
};

// Send email helper function
export const sendEmail = async (emailData: any): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const result = await transporter.sendMail(emailData);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Email template for verification
export const createVerificationEmail = (email: string, token: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Verify Your Email - Job Genie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Job Genie</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Job Matching Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Email Verification Required</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${firstName || 'there'},<br><br>
            Thank you for registering with Job Genie! To complete your registration and access your account, 
            please verify your email address by entering the verification code below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; min-width: 200px;">
              ${token}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
            Enter this 6-digit verification code in the Job Genie application to verify your email address.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
            This verification code will expire in 24 hours. If you didn't create an account with Job Genie, 
            you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2024 Job Genie. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Job Genie - Email Verification Required
      
      Hi ${firstName || 'there'},
      
      Thank you for registering with Job Genie! To complete your registration and access your account, 
      please verify your email address by entering the verification code below:
      
      Verification Code: ${token}
      
      Enter this 6-digit verification code in the Job Genie application to verify your email address.
      
      This verification code will expire in 24 hours. If you didn't create an account with Job Genie, 
      you can safely ignore this email.
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Email template for company approval notification
export const createCompanyApprovalEmail = (email: string, companyName: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Company Profile Approved - Job Genie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Job Genie</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Job Matching Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; 
                        display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
              ✓
            </div>
          </div>
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Company Profile Approved!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            Congratulations ${firstName || 'there'}! Your company profile for <strong>${companyName}</strong> has been successfully approved by our verification team.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center;">
            You can now access your employer dashboard and start posting job opportunities to find the best candidates for your company.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/employer/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Access Your Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2024 Job Genie. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Job Genie - Company Profile Approved
      
      Congratulations ${firstName || 'there'}! Your company profile for ${companyName} has been successfully approved by our verification team.
      
      You can now access your employer dashboard and start posting job opportunities to find the best candidates for your company.
      
      Access your dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/employer/dashboard
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Email template for company rejection notification
export const createCompanyRejectionEmail = (email: string, companyName: string, reason?: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Company Profile Review Required - Job Genie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Job Genie</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Job Matching Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #dc3545; color: white; width: 60px; height: 60px; border-radius: 50%; 
                        display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
              !
            </div>
          </div>
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Company Profile Review Required</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            Hi ${firstName || 'there'},<br><br>
            We've reviewed your company profile for <strong>${companyName}</strong> and need some additional information or corrections before we can approve it.
          </p>
          
          ${reason ? `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">Review Notes:</h3>
            <p style="color: #856404; margin: 0;">${reason}</p>
          </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center;">
            Please review your company profile information and update any incorrect or missing details. 
            Ensure all documents are clear and valid before resubmitting for review.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/employer/company/profile/edit" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Update Your Profile
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2024 Job Genie. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Job Genie - Company Profile Review Required
      
      Hi ${firstName || 'there'},
      
      We've reviewed your company profile for ${companyName} and need some additional information or corrections before we can approve it.
      
      ${reason ? `Review Notes: ${reason}` : ''}
      
      Please review your company profile information and update any incorrect or missing details. 
      Ensure all documents are clear and valid before resubmitting for review.
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Email template for interview notification
export const createInterviewNotificationEmail = (
  email: string, 
  candidateName: string, 
  companyName: string, 
  designation: string, 
  timeSlots: Array<{date: string, time: string}>,
  notificationId?: string
) => {
  console.log('createInterviewNotificationEmail called with:', {
    email,
    candidateName,
    companyName,
    designation,
    timeSlots,
    notificationId
  });
  const timeSlotsHtml = timeSlots.map(slot => 
    `<li style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #667eea;">
      <strong>Date:</strong> ${new Date(slot.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}<br>
      <strong>Time:</strong> ${slot.time}
    </li>`
  ).join('');

  const timeSlotsText = timeSlots.map(slot => 
    `- Date: ${new Date(slot.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}, Time: ${slot.time}`
  ).join('\n');

  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: `Interview Invitation from ${companyName} - Job Genie`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Job Genie</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Job Matching Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #667eea; color: white; width: 60px; height: 60px; border-radius: 50%; 
                        display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
              📧
            </div>
          </div>
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Interview Invitation</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${candidateName || 'there'},<br><br>
            Great news! <strong>${companyName}</strong> is interested in having an interview with you for the <strong>${designation}</strong> position.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            They have provided the following time slots for your convenience:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e9ecef;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Available Time Slots:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${timeSlotsHtml}
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            If you are interested in this opportunity, please follow the link below to log in and confirm your preferred time slot.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login${notificationId ? `?notification=${notificationId}` : ''}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Login to Confirm Time Slot
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
            Please respond as soon as possible to secure your preferred time slot. If none of these times work for you, 
            you can contact the employer directly through the platform after logging in.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2024 Job Genie. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Job Genie - Interview Invitation
      
      Hi ${candidateName || 'there'},
      
      Great news! ${companyName} is interested in having an interview with you for the ${designation} position.
      
      They have provided the following time slots for your convenience:
      
      ${timeSlotsText}
      
      If you are interested in this opportunity, please follow the link below to log in and confirm your preferred time slot.
      
      Login to confirm: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login
      
      Please respond as soon as possible to secure your preferred time slot. If none of these times work for you, 
      you can contact the employer directly through the platform after logging in.
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Email template for verification success
export const createVerificationSuccessEmail = (email: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Email Verified Successfully - Job Genie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Job Genie</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your AI-Powered Job Matching Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; 
                        display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
              ✓
            </div>
          </div>
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Email Verified Successfully!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            Congratulations ${firstName || 'there'}! Your email address has been successfully verified.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center;">
            You can now log in to your Job Genie account and start exploring job opportunities 
            or complete your candidate profile to get better job matches.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Login to Job Genie
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2024 Job Genie. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </div>
      </div>
    `,
    text: `
      Job Genie - Email Verified Successfully
      
      Congratulations ${firstName || 'there'}! Your email address has been successfully verified.
      
      You can now log in to your Job Genie account and start exploring job opportunities 
      or complete your candidate profile to get better job matches.
      
      Login to Job Genie: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login
      
      Best regards,
      The Job Genie Team
    `
  };
};
