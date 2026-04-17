import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products - List all products with optional filters
router.get('/', async (req, res) => {
    try {
        const { category, bodyType, skinTone, occasion, style, gender } = req.query;

        const filter = { isActive: true };
        if (category) filter.category = category;
        if (bodyType) filter.bodyTypes = { $in: [bodyType] };
        if (skinTone) filter.skinTones = { $in: [skinTone] };
        if (occasion) filter.occasions = { $in: [occasion] };
        if (style) filter.style = style;
        if (gender) filter.gender = { $in: [gender, 'unisex'] };

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

// GET /api/products/recommend - Get recommendations based on body type + skin tone + occasion
router.get('/recommend', async (req, res) => {
    try {
        const { bodyType, skinTone, occasion, gender } = req.query;

        if (!bodyType) {
            return res.status(400).json({
                success: false,
                error: { message: 'bodyType is required for recommendations' },
            });
        }

        // Build match query
        const matchQuery = { isActive: true, bodyTypes: { $in: [bodyType] } };
        if (gender) matchQuery.gender = { $in: [gender, 'unisex'] };
        // STRICT FILTERING: Only show products that match the selected occasion
        if (occasion) matchQuery.occasions = { $in: [occasion] };

        // Use aggregation to score matches
        const products = await Product.aggregate([
            { $match: matchQuery },
            {
                $addFields: {
                    // Calculate a match score: +1 for each matching criterion
                    matchScore: {
                        $sum: [
                            1, // bodyType already matched
                            skinTone ? { $cond: [{ $in: [skinTone, '$skinTones'] }, 1, 0] } : 0,
                            // Occasion is now a hard filter, but we can still add to score for ranking if needed, 
                            // or just rely on the filter. Let's keep it to boost "perfect" matches.
                            occasion ? { $cond: [{ $in: [occasion, '$occasions'] }, 1, 0] } : 0,
                        ],
                    },
                    maxScore: {
                        $sum: [1, skinTone ? 1 : 0, occasion ? 1 : 0],
                    },
                },
            },
            { $sort: { matchScore: -1, createdAt: -1 } },
        ]);

        // Add percentage match
        const recommendations = products.map(p => ({
            ...p,
            matchPercentage: Math.round((p.matchScore / p.maxScore) * 100),
        }));

        res.json({
            success: true,
            count: recommendations.length,
            filters: { bodyType, skinTone, occasion, gender },
            data: recommendations,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

// GET /api/products/:id - Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: { message: 'Product not found' },
            });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

export default router;
