import { createTransporter } from './email';

// Email template for profile approval
export const createProfileApprovalEmail = (email: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Profile Approved - Welcome to Job Genie!',
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
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Profile Approved!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            Congratulations ${firstName || 'candidate'}! Your profile has been approved by our team.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center;">
            You can now find jobs and grow your career on Job Genie. Start exploring opportunities 
            that match your skills and experience!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Browse Jobs
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
      Job Genie - Profile Approved!
      
      Congratulations ${firstName || 'there'}! Your profile has been approved by our team.
      
      You can now find jobs and grow your career on Job Genie. Start exploring opportunities 
      that match your skills and experience!
      
      Browse Jobs: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Email template for profile rejection
export const createProfileRejectionEmail = (email: string, firstName?: string) => {
  return {
    from: `"Job Genie" <${process.env.SMTP_USER || 'noreply@jobgenie.com'}>`,
    to: email,
    subject: 'Profile Status Update - Job Genie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px; text-align: center;">
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
          
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Profile Status Update</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            Dear ${firstName || 'candidate'}, we regret to inform you that your profile has been rejected.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center;">
            This may be due to incomplete information or other requirements that need to be met. 
            Please review your profile and make necessary updates.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                      padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                      display: inline-block; font-weight: bold; font-size: 16px;">
              Update Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0; text-align: center; font-size: 14px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
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
      Job Genie - Profile Status Update
      
      Dear ${firstName || 'candidate'}, we regret to inform you that your profile has been rejected.
      
      This may be due to incomplete information or other requirements that need to be met. 
      Please review your profile and make necessary updates.
      
      Update Profile: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/candidate/login
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Best regards,
      The Job Genie Team
    `
  };
};

// Function to send profile approval email
export const sendProfileApprovalEmail = async (email: string, firstName?: string) => {
  try {
    const transporter = createTransporter();
    const mailOptions = createProfileApprovalEmail(email, firstName);
    
    await transporter.sendMail(mailOptions);
    console.log(`Profile approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending profile approval email:', error);
    return false;
  }
};

// Function to send profile rejection email
export const sendProfileRejectionEmail = async (email: string, firstName?: string) => {
  try {
    const transporter = createTransporter();
    const mailOptions = createProfileRejectionEmail(email, firstName);
    
    await transporter.sendMail(mailOptions);
    console.log(`Profile rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending profile rejection email:', error);
    return false;
  }
};
