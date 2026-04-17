
import requests
import base64
import os
import random
import json

BASE_URL = 'http://localhost:5000'
TEST_DIR = 'train/data/test'

def test_health():
    print(f"🏥 Testing Health Endpoint ({BASE_URL}/health)...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health Check Passed:")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        return False

def test_predict_json():
    print(f"\n🔮 Testing Prediction (JSON/Base64)...")
    
    # Find a test image
    body_types = os.listdir(TEST_DIR)
    if not body_types:
        print("❌ No test data found.")
        return
    
    random_type = random.choice(body_types)
    type_dir = os.path.join(TEST_DIR, random_type)
    images = os.listdir(type_dir)
    
    if not images:
        print(f"❌ No images found in {type_dir}")
        return
        
    image_path = os.path.join(type_dir, random.choice(images))
    print(f"📄 Using test image: {image_path} (True Label: {random_type})")
    
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
    payload = {"image": encoded_string}
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction Success:")
            print(f"   Predicted: {result['body_type']} (Confidence: {result['confidence']:.2f})")
            print(f"   True Label: {random_type}")
        else:
            print(f"❌ Prediction Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_predict_multipart():
    print(f"\n📁 Testing Prediction (Multipart/File)...")
    
    # Find a test image (reuse logic)
    body_types = os.listdir(TEST_DIR)
    random_type = random.choice(body_types)
    type_dir = os.path.join(TEST_DIR, random_type)
    images = os.listdir(type_dir)
    image_path = os.path.join(type_dir, random.choice(images))
    print(f"📄 Using test image: {image_path} (True Label: {random_type})")
    
    files = {'image': open(image_path, 'rb')}
    
    try:
        response = requests.post(f"{BASE_URL}/predict", files=files)
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction Success:")
            print(f"   Predicted: {result['body_type']} (Confidence: {result['confidence']:.2f})")
        else:
            print(f"❌ Prediction Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if test_health():
        test_predict_json()
        test_predict_multipart()
