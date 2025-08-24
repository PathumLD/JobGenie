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
