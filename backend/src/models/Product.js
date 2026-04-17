import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['top', 'bottom', 'dress', 'outerwear', 'accessory'],
    },
    subCategory: {
        type: String,
        trim: true,
        // e.g., 't-shirt', 'blouse', 'jeans', 'skirt', 'maxi-dress', etc.
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        default: 'unisex',
    },

    // Display image (normal product photo)
    imageUrl: {
        type: String,
        required: true,
    },

    // AR try-on image (transparent PNG)
    arAssetImage: {
        type: String,
        default: null,
    },

    // Recommendation tags
    bodyTypes: [{
        type: String,
        enum: ['hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle'],
    }],

    skinTones: [{
        type: String,
        enum: ['fair', 'light', 'medium', 'olive', 'brown', 'dark'],
    }],

    occasions: [{
        type: String,
        enum: ['casual', 'formal', 'party', 'wedding', 'office', 'sporty', 'date', 'beach'],
    }],

    colors: [{
        type: String,
        trim: true,
    }],

    style: {
        type: String,
        enum: ['casual', 'formal', 'sporty', 'bohemian', 'streetwear', 'classic', 'trendy', 'minimalist'],
        default: 'casual',
    },

    // Optional e-commerce link
    shopUrl: {
        type: String,
        default: null,
    },

    price: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
    },

    // Metadata
    description: {
        type: String,
        trim: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Index for recommendation queries
productSchema.index({ bodyTypes: 1, skinTones: 1, occasions: 1 });
productSchema.index({ category: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
