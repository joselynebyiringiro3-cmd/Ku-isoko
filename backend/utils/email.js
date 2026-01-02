const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, code, subject = 'Password Reset OTP') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Ku-isoko" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send verification email
const sendVerificationEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Ku-isoko" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Ku-isoko - Account Created',
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error for verification email
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
};
