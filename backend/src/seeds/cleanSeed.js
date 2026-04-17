import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const sampleProducts = [
    // ===== TOPS =====
    {
        name: 'Classic White Button-Down Shirt',
        category: 'top',
        subCategory: 'shirt',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        tryOnImage: 'https://i.postimg.cc/white-shirt-tryon.png',
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['formal', 'office', 'casual', 'date'],
        colors: ['white'],
        style: 'classic',
        description: 'A timeless white button-down that works for every body type. Versatile for any occasion.',
        price: { amount: 39.99, currency: 'USD' },
    },
    {
        name: 'Navy Blue V-Neck Blouse',
        category: 'top',
        subCategory: 'blouse',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
        tryOnImage: null,
        bodyTypes: ['apple', 'pear', 'hourglass'],
        skinTones: ['fair', 'light', 'medium'],
        occasions: ['office', 'casual', 'date'],
        colors: ['navy', 'blue'],
        style: 'classic',
        description: 'V-neck creates an elongating effect. Great for apple and pear body types.',
        price: { amount: 34.99, currency: 'USD' },
    },
    {
        name: 'Black Fitted Crop Top',
        category: 'top',
        subCategory: 'crop-top',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
        tryOnImage: null,
        bodyTypes: ['hourglass', 'rectangle', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['party', 'casual', 'date'],
        colors: ['black'],
        style: 'trendy',
        description: 'Sleek black crop top that highlights the waistline.',
        price: { amount: 24.99, currency: 'USD' },
    },
    {
        name: 'Coral Peplum Top',
        category: 'top',
        subCategory: 'peplum',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'inverted-triangle'],
        skinTones: ['medium', 'olive', 'brown'],
        occasions: ['casual', 'date', 'party'],
        colors: ['coral', 'pink'],
        style: 'trendy',
        description: 'Peplum flare creates curves and balances wider shoulders.',
        price: { amount: 29.99, currency: 'USD' },
    },
    {
        name: 'Olive Green Henley T-Shirt',
        category: 'top',
        subCategory: 't-shirt',
        gender: 'male',
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'inverted-triangle', 'hourglass'],
        skinTones: ['medium', 'olive', 'brown', 'dark'],
        occasions: ['casual', 'date'],
        colors: ['olive', 'green'],
        style: 'casual',
        description: 'Relaxed henley in earthy olive tone. Great for warm skin tones.',
        price: { amount: 22.99, currency: 'USD' },
    },

    // ===== BOTTOMS =====
    {
        name: 'High-Waist Wide Leg Trousers',
        category: 'bottom',
        subCategory: 'trousers',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        tryOnImage: null,
        bodyTypes: ['pear', 'hourglass', 'apple'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['office', 'formal', 'casual'],
        colors: ['black'],
        style: 'classic',
        description: 'High waist elongates legs. Wide-leg balances pear and hourglass proportions.',
        price: { amount: 49.99, currency: 'USD' },
    },
    {
        name: 'Dark Wash Slim-Fit Jeans',
        category: 'bottom',
        subCategory: 'jeans',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['casual', 'date', 'party'],
        colors: ['dark blue', 'indigo'],
        style: 'casual',
        description: 'Universally flattering dark wash. Slim fit creates a clean silhouette.',
        price: { amount: 54.99, currency: 'USD' },
    },
    {
        name: 'A-Line Midi Skirt',
        category: 'bottom',
        subCategory: 'skirt',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
        tryOnImage: null,
        bodyTypes: ['pear', 'apple', 'rectangle'],
        skinTones: ['fair', 'light', 'medium'],
        occasions: ['office', 'casual', 'date', 'wedding'],
        colors: ['beige', 'tan'],
        style: 'classic',
        description: 'A-line shape skims over hips. Perfect for pear body types.',
        price: { amount: 44.99, currency: 'USD' },
    },
    {
        name: 'Khaki Chinos',
        category: 'bottom',
        subCategory: 'chinos',
        gender: 'male',
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'inverted-triangle', 'hourglass'],
        skinTones: ['fair', 'light', 'medium', 'olive'],
        occasions: ['office', 'casual', 'date'],
        colors: ['khaki', 'beige'],
        style: 'classic',
        description: 'Versatile khaki chinos. Slim-tapered leg for a modern look.',
        price: { amount: 39.99, currency: 'USD' },
    },

    // ===== DRESSES =====
    {
        name: 'Emerald Wrap Dress',
        category: 'dress',
        subCategory: 'wrap-dress',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
        tryOnImage: null,
        bodyTypes: ['hourglass', 'pear', 'apple'],
        skinTones: ['medium', 'olive', 'brown', 'dark'],
        occasions: ['date', 'party', 'wedding', 'office'],
        colors: ['emerald', 'green'],
        style: 'classic',
        description: 'Wrap silhouette is universally flattering. Emerald complements warm to dark tones.',
        price: { amount: 64.99, currency: 'USD' },
    },
    {
        name: 'Little Black Dress - Shift Style',
        category: 'dress',
        subCategory: 'shift-dress',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'apple', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['party', 'formal', 'date', 'office'],
        colors: ['black'],
        style: 'classic',
        description: 'The ultimate LBD. Shift style skims the body without clinging.',
        price: { amount: 59.99, currency: 'USD' },
    },
    {
        name: 'Floral Maxi Dress',
        category: 'dress',
        subCategory: 'maxi-dress',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
        tryOnImage: null,
        bodyTypes: ['pear', 'hourglass', 'rectangle'],
        skinTones: ['fair', 'light', 'medium'],
        occasions: ['casual', 'beach', 'date', 'wedding'],
        colors: ['floral', 'multicolor'],
        style: 'bohemian',
        description: 'Flowing maxi with floral print. Elongates and creates a romantic silhouette.',
        price: { amount: 54.99, currency: 'USD' },
    },
    {
        name: 'Navy Bodycon Dress',
        category: 'dress',
        subCategory: 'bodycon',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
        tryOnImage: null,
        bodyTypes: ['hourglass'],
        skinTones: ['fair', 'light', 'medium', 'olive'],
        occasions: ['party', 'date'],
        colors: ['navy', 'blue'],
        style: 'trendy',
        description: 'Body-hugging fit that celebrates hourglass curves.',
        price: { amount: 44.99, currency: 'USD' },
    },

    // ===== OUTERWEAR =====
    {
        name: 'Structured Blazer - Charcoal',
        category: 'outerwear',
        subCategory: 'blazer',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'pear', 'apple'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['formal', 'office', 'date'],
        colors: ['charcoal', 'gray'],
        style: 'formal',
        description: 'Structured shoulders add definition. Perfect for rectangle and pear shapes.',
        price: { amount: 89.99, currency: 'USD' },
    },
    {
        name: 'Camel Trench Coat',
        category: 'outerwear',
        subCategory: 'trench',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
        tryOnImage: null,
        bodyTypes: ['hourglass', 'rectangle', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive'],
        occasions: ['formal', 'office', 'casual'],
        colors: ['camel', 'beige', 'tan'],
        style: 'classic',
        description: 'Belted waist defines shape. Camel complements lighter skin tones beautifully.',
        price: { amount: 119.99, currency: 'USD' },
    },
    {
        name: 'Black Leather Jacket',
        category: 'outerwear',
        subCategory: 'jacket',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'hourglass', 'inverted-triangle', 'pear', 'apple'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
        occasions: ['casual', 'party', 'date'],
        colors: ['black'],
        style: 'streetwear',
        description: 'A universal statement piece. Works with every body type and skin tone.',
        price: { amount: 99.99, currency: 'USD' },
    },
    {
        name: 'Denim Jacket - Light Wash',
        category: 'outerwear',
        subCategory: 'jacket',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'pear', 'hourglass'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown'],
        occasions: ['casual', 'date', 'beach'],
        colors: ['light blue', 'denim'],
        style: 'casual',
        description: 'Casual layering staple. Light wash pairs well with warm and neutral tones.',
        price: { amount: 59.99, currency: 'USD' },
    },

    // ===== ACCESSORIES =====
    {
        name: 'Gold Statement Necklace',
        category: 'accessory',
        subCategory: 'necklace',
        gender: 'female',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'pear', 'apple', 'hourglass', 'inverted-triangle'],
        skinTones: ['medium', 'olive', 'brown', 'dark'],
        occasions: ['party', 'wedding', 'date', 'formal'],
        colors: ['gold'],
        style: 'trendy',
        description: 'Gold tones complement warm and dark skin beautifully.',
        price: { amount: 29.99, currency: 'USD' },
    },
    {
        name: 'Silver Minimalist Watch',
        category: 'accessory',
        subCategory: 'watch',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'pear', 'apple', 'hourglass', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium'],
        occasions: ['office', 'formal', 'casual', 'date'],
        colors: ['silver'],
        style: 'minimalist',
        description: 'Cool-toned silver pairs perfectly with fair to medium skin.',
        price: { amount: 79.99, currency: 'USD' },
    },
    {
        name: 'Brown Leather Belt',
        category: 'accessory',
        subCategory: 'belt',
        gender: 'unisex',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        tryOnImage: null,
        bodyTypes: ['rectangle', 'inverted-triangle'],
        skinTones: ['fair', 'light', 'medium', 'olive', 'brown'],
        occasions: ['casual', 'office', 'formal'],
        colors: ['brown', 'tan'],
        style: 'classic',
        description: 'Cinching the waist creates shape on rectangle and inverted-triangle figures.',
        price: { amount: 34.99, currency: 'USD' },
    },
];

async function cleanSeedProducts() {
    try {
        const mongoUri = process.env.MONGODB_URI;

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Drop the entire database to clear any schema/index conflicts
        console.log('🗑️  Dropping database to clear schema conflicts...');
        await mongoose.connection.dropDatabase();
        console.log('✅ Database dropped successfully\n');

        // Reconnect to re-create the database
        await mongoose.disconnect();
        await mongoose.connect(mongoUri);
        console.log('🔄 Reconnected to MongoDB\n');

        // Insert seed data with fresh schema
        console.log('📦 Inserting products...');
        const inserted = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${inserted.length} products!\n`);

        // Summary
        const categories = {};
        inserted.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });

        console.log('📊 Products by category:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} items`);
        });

        console.log('\n🎉 Seed complete! Database is ready.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

cleanSeedProducts();
