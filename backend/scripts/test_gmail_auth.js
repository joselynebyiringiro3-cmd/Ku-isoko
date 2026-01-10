const nodemailer = require('nodemailer');

const config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'joselynebyiringiro3@gmail.com',
        pass: 'zusw odgn parh yvwc'
    }
};

async function verify() {
    console.log('🔍 Testing Gmail Credentials (Port 465)...');
    console.log(`User: ${config.auth.user}`);

    try {
        const transporter = nodemailer.createTransport(config);

        // 1. Verify connection
        await transporter.verify();
        console.log('✅ Connection Successful! Credentials are valid.');

        // 2. Try sending a test email to self
        const info = await transporter.sendMail({
            from: `"Test" <${config.auth.user}>`,
            to: config.auth.user,
            subject: 'Ku-isoko SMTP Test',
            text: 'If you see this, your email credentials are working correctly!'
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

verify();
