const nodemailer = require('nodemailer');

async function createTestAccount() {
    try {
        const testAccount = await nodemailer.createTestAccount();

        console.log('✨ Ethereal Account Created!');
        console.log('----------------------------');
        console.log(`EMAIL_USER=${testAccount.user}`);
        console.log(`EMAIL_PASS=${testAccount.pass}`);
        console.log('----------------------------');
        console.log('Copy these values into your .env file.');
    } catch (err) {
        console.error('Failed to create test account:', err);
    }
}

createTestAccount();
