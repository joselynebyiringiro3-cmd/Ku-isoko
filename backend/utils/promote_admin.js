const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        if (!email) {
            console.log('Fetching all users to help you choose...');
            const users = await User.find({}, 'name email role');
            console.table(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role })));
            console.log('\nUsage: node promote_admin.js <email>');
            process.exit(0);
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\nSUCCESS: ${user.name} (${user.email}) has been promoted to ADMIN.`);
        console.log('Please log out and log back in on the website to see the changes.\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const email = process.argv[2];
promoteToAdmin(email);
