import axios from 'axios';

// CP-VTON API URL - Set this to your Colab ngrok URL
const CPVTON_API_URL = import.meta.env.VITE_CPVTON_API_URL || 'http://localhost:8000/api';

/**
 * CP-VTON Virtual Try-On Service
 * Communicates with the CP-VTON backend running on Google Colab
 */

/**
 * Health check - verify CP-VTON backend is running
 */
export const checkCPVTONHealth = async () => {
    try {
        const response = await axios.get(`${CPVTON_API_URL}/health`, { timeout: 10000 });
        return response.data;
    } catch (error) {
        console.error('CP-VTON health check failed:', error.message);
        return { status: 'unreachable', error: error.message };
    }
};

/**
 * Get clothing catalog, optionally filtered by gender/category
 * @param {string} gender - 'male' or 'female' (optional)
 * @param {string} category - 'casual', 'formal', or 'traditional' (optional)
 */
export const getClothingCatalog = async (gender = null, category = null) => {
    try {
        const params = {};
        if (gender) params.gender = gender;
        if (category) params.category = category;

        const response = await axios.get(`${CPVTON_API_URL}/clothing`, { params, timeout: 10000 });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch clothing catalog:', error.message);
        throw error;
    }
};

/**
 * Generate virtual try-on using CP-VTON
 * @param {string} personImageBase64 - Base64-encoded person photo
 * @param {string} clothingId - ID of clothing item from catalog
 * @returns {object} - { success, result_image (base64), processing_time_seconds }
 */
export const generateTryOn = async (personImageBase64, clothingId) => {
    try {
        const response = await axios.post(
            `${CPVTON_API_URL}/try-on-base64`,
            {
                person_image: personImageBase64,
                clothing_id: clothingId,
            },
            {
                timeout: 30000, // 30 second timeout for GPU processing
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Try-on generation failed:', error.message);
        throw error;
    }
};

/**
 * Generate try-on using FormData (file upload)
 * @param {File} personImageFile - Person image file
 * @param {string} clothingId - ID of clothing item
 */
export const generateTryOnFile = async (personImageFile, clothingId) => {
    try {
        const formData = new FormData();
        formData.append('person_image', personImageFile);
        formData.append('clothing_id', clothingId);

        const response = await axios.post(
            `${CPVTON_API_URL}/try-on`,
            formData,
            {
                timeout: 30000,
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Try-on generation failed:', error.message);
        throw error;
    }
};

/**
 * Convert a canvas element to base64
 * @param {HTMLCanvasElement} canvas
 * @returns {string} base64 encoded image
 */
export const canvasToBase64 = (canvas) => {
    return canvas.toDataURL('image/jpeg', 0.9);
};

/**
 * Convert a video frame to base64 for try-on
 * @param {HTMLVideoElement} videoEl 
 * @returns {string} base64 encoded frame
 */
export const captureVideoFrame = (videoEl) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
};

export default {
    checkCPVTONHealth,
    getClothingCatalog,
    generateTryOn,
    generateTryOnFile,
    canvasToBase64,
    captureVideoFrame,
};
