from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'body_type_classifier.h5')
BODY_TYPES = ['hourglass', 'pear', 'apple', 'rectangle', 'inverted-triangle']

# ── Global model (CNN fallback only) ─────────────────────────────────────────
model = None
load_error = None

def load_cnn_model():
    global model, load_error
    try:
        if not os.path.exists(MODEL_PATH):
            load_error = "MODEL_NOT_FOUND"
            return
        if os.path.getsize(MODEL_PATH) < 2000:
            load_error = "LFS_POINTER_DETECTED"
            return

        import keras
        @keras.saving.register_keras_serializable(package="Custom")
        class PatchedDense(keras.layers.Dense):
            def __init__(self, *args, quantization_config=None, **kwargs):
                super().__init__(*args, **kwargs)
                self.quantization_config = quantization_config
            def get_config(self):
                config = super().get_config()
                config["quantization_config"] = self.quantization_config
                return config

        try:
            model = keras.models.load_model(MODEL_PATH, custom_objects={'Dense': PatchedDense})
            print("✅ CNN fallback model loaded.")
        except Exception:
            model = keras.models.load_model(MODEL_PATH)
            print("✅ CNN fallback model loaded (standard).")
        load_error = None
    except Exception as e:
        print(f"⚠️  CNN model failed to load (landmark classifier will be used): {e}")
        load_error = str(e)

load_cnn_model()


# ── Helpers ───────────────────────────────────────────────────────────────────

def decode_image(image_data):
    """Accept base64 string or bytes; return numpy array."""
    from utils.preprocessing import preprocess_image
    return preprocess_image(image_data)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'service': 'StyleSync ML Service — VirtualMirror AI',
        'landmark_classifier': 'active',
        'cnn_fallback': model is not None,
        'version': '2.0.0'
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'landmark_classifier': 'active (primary)',
        'cnn_model': 'loaded' if model is not None else f'unavailable ({load_error})',
        'supported_classes': BODY_TYPES,
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Enhanced prediction endpoint.
    Accepts:
      - landmarks: list of 33 MediaPipe pose landmark dicts (primary)
      - image: base64 image string (CNN fallback)
      - height_cm, gender, user_waist_cm, user_hip_cm, user_chest_cm (optional)
    """
    try:
        data = request.get_json(force=True) or {}

        landmarks     = data.get('landmarks')       # list of 33 {x,y,z,visibility}
        height_cm     = data.get('height_cm')       # float cm e.g. 165
        gender        = data.get('gender', 'female')
        user_waist    = data.get('user_waist_cm')
        user_hip      = data.get('user_hip_cm')
        user_chest    = data.get('user_chest_cm')
        image_height  = data.get('image_height_px') # int, canvas height
        image_data    = data.get('image')           # base64 fallback

        # ── PRIMARY: Landmark classifier ─────────────────────────────────────
        if landmarks:
            from utils.landmark_body_classifier import classify
            result = classify(
                landmarks=landmarks,
                image_height_px=image_height,
                height_cm=float(height_cm) if height_cm else None,
                gender=gender,
                user_waist_cm=float(user_waist) if user_waist else None,
                user_hip_cm=float(user_hip) if user_hip else None,
                user_chest_cm=float(user_chest) if user_chest else None,
            )
            return jsonify({
                'body_type': result['body_type'],
                'confidence': result['confidence'],
                'measurements': result['measurements'],
                'method': result['method'],
                'classifier': 'landmark',
            })

        # ── SECONDARY: Measurements only (no scan) ───────────────────────────
        if user_waist and user_hip and user_chest:
            from utils.landmark_body_classifier import classify_from_measurements_only
            body_type, confidence = classify_from_measurements_only(
                float(user_waist), float(user_hip), float(user_chest), gender
            )
            return jsonify({
                'body_type': body_type,
                'confidence': confidence,
                'measurements': {
                    'waist_cm': float(user_waist),
                    'hip_cm': float(user_hip),
                    'chest_cm': float(user_chest),
                },
                'method': 'measurements_only',
                'classifier': 'rule_based',
            })

        # ── FALLBACK: CNN image classifier ───────────────────────────────────
        if image_data and model is not None:
            import keras
            img_array = decode_image(image_data)
            predictions = model.predict(img_array, verbose=0)[0]
            predicted_idx = int(np.argmax(predictions))
            confidence = float(predictions[predicted_idx])

            return jsonify({
                'body_type': BODY_TYPES[predicted_idx],
                'confidence': confidence,
                'all_predictions': {bt: float(predictions[i]) for i, bt in enumerate(BODY_TYPES)},
                'method': 'cnn_image',
                'classifier': 'cnn',
            })

        return jsonify({'error': 'No landmarks, measurements, or image provided.'}), 400

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'primary_classifier': 'landmark_ratio_engine',
        'fallback_classifier': 'mobilenetv2_cnn' if model else 'unavailable',
        'cnn_loaded': model is not None,
        'classes': BODY_TYPES,
    })


if __name__ == '__main__':
    print("🚀 Starting StyleSync ML Service v2.0 (Landmark-First)...")
    app.run(host='0.0.0.0', port=5000, debug=True)
