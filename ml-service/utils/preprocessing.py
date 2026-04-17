
import io
import base64
import numpy as np
from PIL import Image

IMAGE_SIZE = (224, 224)

def preprocess_image(image_data):
    """
    Preprocess image for model prediction
    Args:
        image_data: base64 encoded image string OR bytes
    Returns:
        Preprocessed numpy array
    """
    try:
        # Check if input is base64 string
        if isinstance(image_data, str):
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        else:
            # Assume it's already bytes (from file upload)
            image_bytes = image_data
            
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize(IMAGE_SIZE)
        
        # Convert to numpy array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        raise ValueError(f"Error processing image: {str(e)}")
