import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const sampleProducts = [
    {
        name: 'Classic White Button-Down Shirt',
        category: 'top',
        subCategory: 'shirt',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['formal', 'office', 'casual', 'date'],
        colors: ['white'],
        style: 'classic',
        description: 'A timeless white button-down that works for every body type.',
        price: { amount: 39.99, currency: 'USD' },
    },
    {
        name: 'Navy Blue V-Neck Blouse',
        category: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
        bodyTypes: ['apple', 'pear', 'hourglass'],
        skinTones: ['fair', 'light', 'medium'],
        occasions: ['office', 'casual', 'date'],
        colors: ['navy', 'blue'],
        style: 'classic',
        description: 'V-neck creates an elongating effect.',
        price: { amount: 34.99 },
    },
    {
        name: 'Emerald Wrap Dress',
        category: 'dress',
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
        bodyTypes: ['hourglass', 'pear', 'apple'],
        skinTones: ['medium', 'olive', 'brown', 'dark'],
        occasions: ['date', 'party', 'wedding'],
        style: 'classic',
        description: 'Wrap silhouette is universally flattering.',
        price: { amount: 64.99 },
    },
    {
        name: 'Dark Wash Slim-Fit Jeans',
        category: 'bottom',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['casual', 'date', 'party'],
        style: 'casual',
        description: 'Universally flattering dark wash.',
        price: { amount: 54.99 },
    },
    {
        name: 'Black Leather Jacket',
        category: 'outerwear',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle', 'pear', 'apple'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['casual', 'party', 'date'],
        style: 'streetwear',
        description: 'A universal statement piece.',
        price: { amount: 99.99 },
    },
];

async function simpleSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Drop only the products collection
        try {
            await Product.collection.drop();
            console.log('🗑️  Dropped products collection');
        } catch (err) {
            if (err.code === 26) {
                console.log('ℹ️  Products collection doesn\'t exist yet (this is fine)');
            } else {
                throw err;
            }
        }

        // Insert products ONE BY ONE to identify which one causes the error
        console.log('\n📦 Inserting products...\n');
        let successCount = 0;

        for (const product of sampleProducts) {
            try {
                await Product.create(product);
                successCount++;
                console.log(`✅ ${successCount}. ${product.name}`);
            } catch (err) {
                console.error(`❌ Failed to insert: ${product.name}`);
                console.error(`   Error: ${err.message}`);
            }
        }

        console.log(`\n🎉 Successfully seeded ${successCount}/${sampleProducts.length} products!`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        process.exit(1);
    }
}

simpleSeed();
