
import requests
import json

NODE_API_URL = 'http://localhost:8080/api/ml'

def test_node_integration():
    print(f"🔗 Testing Node.js -> ML Service Integration ({NODE_API_URL}/health)...")
    try:
        response = requests.get(f"{NODE_API_URL}/health")
        if response.status_code == 200:
            print("✅ Integration Check Passed!")
            print("Response from Node.js (proxying ML service):")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"❌ Integration Check Failed: {response.status_code}")
            print(response.text)
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Node.js server. Is it running on port 8080?")
        return False

if __name__ == "__main__":
    test_node_integration()
