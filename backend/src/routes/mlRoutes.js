
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// POST /api/ml/predict - Predict body type
router.post('/predict', upload.single('image'), async (req, res) => {
    try {
        let response;

        // Handle File Upload (Multipart)
        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
        }
        // Handle Base64 JSON
        else if (req.body.image) {
            response = await axios.post(`${ML_SERVICE_URL}/predict`, {
                image: req.body.image
            });
        } else {
            return res.status(400).json({
                success: false,
                error: { message: 'No image data provided' }
            });
        }

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('ML Service Error:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(503).json({
                success: false,
                error: { message: 'ML Service Unavailable' }
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({
                success: false,
                error: { message: error.message }
            });
        }
    }
});

// GET /api/ml/health - Check ML service health
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`);
        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: { message: 'ML Service Unavailable' }
        });
    }
});

export default router;
