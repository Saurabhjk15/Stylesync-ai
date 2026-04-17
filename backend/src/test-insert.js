import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function testInsert() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test with a single, simple product
        const testProduct = {
            name: 'Test Product',
            category: 'top',
            imageUrl: 'https://example.com/test.jpg',
            bodyTypes: ['hourglass'],
            skinTones: ['medium'],
            occasions: ['casual'],
            price: { amount: 29.99 }
        };

        console.log('Attempting to insert:', JSON.stringify(testProduct, null, 2));

        const result = await Product.create(testProduct);
        console.log('\n✅ Success! Inserted:', result);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed:', error);
        console.error('\nFull error:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

testInsert();
