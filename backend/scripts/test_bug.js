const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User'); // Need a user for sellerId
require('dotenv').config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create a dummy seller
        let seller = await User.findOne({ email: 'test_bug_seller@example.com' });
        if (!seller) {
            seller = await User.create({
                name: 'Test Seller',
                email: 'test_bug_seller@example.com',
                password: 'Password123!',
                role: 'seller'
            });
        }

        // 2. Create Product
        const input = {
            name: 'Test Product OffByOne',
            description: 'Testing for off by one error',
            price: 80000,
            stock: 12,
            category: 'Electronics',
            imageUrl: '/test.jpg',
            sellerId: seller._id
        };

        console.log('Creating Product with:', input);
        const product = await Product.create(input);
        console.log('Product Created. ID:', product._id);

        // 3. Fetch back
        const fetched = await Product.findById(product._id);
        console.log('Fetched Product:');
        console.log('Price:', fetched.price);
        console.log('Stock:', fetched.stock);

        if (fetched.price === 79999 || fetched.stock === 11) {
            console.log('BUG REPRODUCED: Values are decremented by 1.');
        } else if (fetched.price === 80000 && fetched.stock === 12) {
            console.log('Back-end works correctly. Bug is likely in Frontend or API Middleware.');
        } else {
            console.log('Something else happened.');
        }

        // Cleanup
        await Product.deleteOne({ _id: product._id });
        // await User.deleteOne({ _id: seller._id }); // Keep seller for re-runs

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
