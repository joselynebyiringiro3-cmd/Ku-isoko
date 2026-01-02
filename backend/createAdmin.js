const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'joselynebyiringiro3@gmail.com';
        const password = 'joselyne123';
        const name = 'Admin Joselyne';

        const userExists = await User.findOne({ email });

        if (userExists) {
            userExists.password = password; // Will be hashed by pre-save
            userExists.role = 'admin';
            userExists.name = name; // Update name too?
            await userExists.save();
            console.log('Admin user updated successfully');
        } else {
            const user = await User.create({
                name,
                email,
                password,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin user created successfully');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
