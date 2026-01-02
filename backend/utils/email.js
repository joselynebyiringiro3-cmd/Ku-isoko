const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Send email using Resend API (HTTPS)
 * This is the most reliable method for Render/Cloud hosting as it bypasses SMTP port blocking.
 */
const sendViaResend = async (mailOptions) => {
  const { from, to, subject, html } = mailOptions;

  try {
    console.log('📨 Sending email via Resend API (HTTPS)...');
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: `Ku-isoko <${from}>`,
        to: [to],
        subject: subject,
        html: html,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✨ Resend API Success:', response.data.id);
    return true;
  } catch (error) {
    console.error('❌ Resend API Error:', error.response?.data || error.message);
    throw new Error('Failed to send email via Resend API');
  }
};

/**
 * Create reusable transporter for Gmail/SMTP fallback
 */
const createSMTPTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT) || 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
};

/**
 * Generic send function that chooses between Resend API and SMTP
 */
const sendEmail = async (mailOptions) => {
  // 1. Use Resend API if key is present (Priority for Cloud)
  if (process.env.RESEND_API_KEY) {
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    return await sendViaResend({ ...mailOptions, from: fromAddress });
  }

  // 2. Fallback to SMTP/Gmail (Priority for Local)
  console.log('📧 Falling back to SMTP/Gmail...');
  const transporter = createSMTPTransporter();
  const fromAddress = process.env.EMAIL_USER;

  const options = {
    ...mailOptions,
    from: `"Ku-isoko" <${fromAddress}>`
  };

  try {
    await transporter.sendMail(options);
    console.log('✨ SMTP Success');
    return true;
  } catch (error) {
    console.error('❌ SMTP Error:', {
      message: error.message,
      code: error.code
    });
    throw new Error('Failed to send email via SMTP');
  }
};

// Send OTP email
const sendOTPEmail = async (email, code, subject = 'Password Reset OTP') => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Please use the OTP code below to proceed with your request on Ku-isoko:</p>
          
          <div class="otp-box">
            <div class="otp-code">${code}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </div>
          
          <p>For security reasons, never share this code with anyone.</p>
          
          <p>Best regards,<br>The Ku-isoko Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Ku-isoko. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

// Send verification email
const sendVerificationEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Ku-isoko! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for creating an account with Ku-isoko! We're excited to have you join our multi-vendor marketplace.</p>
          <p>Your account has been successfully created and verified. You can now start exploring products from our sellers or manage your own store if you're a seller.</p>
          <p>Best regards,<br>The Ku-isoko Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Ku-isoko. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject: 'Welcome to Ku-isoko - Account Created', html });
  } catch (error) {
    return false; // Non-critical
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
};
