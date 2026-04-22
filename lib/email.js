import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendConsentEmail(userEmail, userName, uploaderName, postId) {
  // Use VERCEL_URL if NEXTAUTH_URL is not set (e.g., in production)
  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const verificationLink = `${baseUrl}/verify-consent?postId=${postId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🛡️ Deep Shield: Your Face Was Detected - Verify with Google Authenticator`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="margin: 0;">🛡️ Deep Shield Consent Request</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Your face was detected in a photo</p>
        </div>

        <div style="padding: 20px; background: #f5f5f5; border-radius: 10px; margin-bottom: 20px;">
          <p>Hi ${userName},</p>
          <p><strong>${uploaderName}</strong> is trying to post a photo that contains your face.</p>
          <p>To protect your privacy, they need your consent before publishing.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-weight: bold;">Quick Consent Verification:</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Use your Google Authenticator app to verify</p>
          </div>

          <a href="${verificationLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Verify Consent →
          </a>

          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            The link will take you to a secure page where you can verify using your Google Authenticator app.
          </p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #666;">
          <p>🔒 Your privacy matters. Deep Shield ensures you have control over your image.</p>
          <p>Amigos Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
