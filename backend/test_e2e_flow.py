
import requests
import json
import base64
import os
import sys

# Constants
NODE_API_URL = 'http://localhost:8080/api/ml/predict'

# Function to encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Mock test (using a real image path if available, or creating a dummy one)
def test_e2e_flow():
    print(f"🚀 Testing End-to-End Flow: Client -> Node.js -> ML Service -> Prediction")
    print(f"Target URL: {NODE_API_URL}")

    # Create a dummy image for testing if no real image exists
    # We can use a simple PIL image generator or assume one exists
    # Let's try to find a real image from the dataset first
    
    test_image_path = None
    dataset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml-service', 'train', 'data', 'test')
    
    # Try to find an image in standard dataset structure
    try:
        for root, dirs, files in os.walk(dataset_path):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    test_image_path = os.path.join(root, file)
                    break
            if test_image_path: break
    except Exception as e:
        print(f"⚠️ Could not search for dataset image: {e}")

    if not test_image_path:
        print("❌ No test image found. Please ensure the dataset is downloaded or provide an image manually.")
        return

    print(f"📸 Using test image: {test_image_path}")
    
    try:
        # Prepare payload (mimicking what Frontend sends)
        # Note: Frontend sends base64 in JSON body in our implementation
        # Wait, our middleware handles both Multipart (file) and JSON (base64)
        # Let's test JSON base64 as that's what we implemented in BodyScan.jsx primarily
        # Actually BodyScan.jsx sends JSON body: { image: "data:image/jpeg;base64,..." }
        
        encoded_string = encode_image(test_image_path)
        base64_image = f"data:image/jpeg;base64,{encoded_string}"
        
        payload = {'image': base64_image}
        headers = {'Content-Type': 'application/json'}

        print("📡 Sending request to Node.js backend...")
        response = requests.post(NODE_API_URL, json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print("\n✅ End-to-End Test SUCCESS!")
            print("--------------------------------------------------")
            print(json.dumps(data, indent=2))
            print("--------------------------------------------------")
            
            if data.get('success') and 'body_type' in data.get('data', {}):
                 print(f"🎉 Prediction: {data['data']['body_type'].upper()}")
                 print(f"📊 Confidence: {data['data']['confidence']:.2%}")
            else:
                 print("⚠️ Response format unexpected (check output above).")
            
        else:
            print(f"\n❌ Test FAILED: Status {response.status_code}")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Could not connect to Node.js (localhost:8080). Is it running?")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_e2e_flow()
