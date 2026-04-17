---
title: AR Fashion Advisor ML
emoji: 👕
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 5000
---

# 🧠 AR Fashion Advisor - ML Service

Machine Learning microservice for body type classification using deep learning.

## 🚀 Quick Start

### 1. Set up Python environment
```powershell
cd ml-service
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

### 3. Prepare dataset
- Download body type images (see `../brain/.../dataset_download_guide.md`)
- Organize in `train/data/train` and `train/data/test` folders

### 4. Train model
```powershell
python train/train_model.py
```

### 5. Start ML service
```powershell
python app.py
```

Service runs on `http://localhost:5000`

## 📁 Project Structure

```
ml-service/
├── app.py                    # Flask API server
├── requirements.txt          # Python dependencies
├── .env                     # Environment variables
├── models/
│   ├── body_classifier.py   # Model architecture
│   └── pretrained/          # Saved models
├── utils/
│   └── preprocessing.py     # Image preprocessing
└── train/
    ├── train_model.py       # Training script
    ├── evaluate_model.py    # Evaluation script
    └── data/                # Dataset folder
        ├── train/
        └── test/
```

## 🔌 API Endpoints

### `GET /`
Health check

### `GET /health`
Detailed health status

### `POST /predict`
Predict body type from image

**Request**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response**:
```json
{
  "body_type": "hourglass",
  "confidence": 0.92,
  "all_predictions": {
    "hourglass": 0.92,
    "pear": 0.05,
    "apple": 0.02,
    "rectangle": 0.01,
    "inverted-triangle": 0.00
  }
}
```

## 🧪 Testing

```powershell
# Test model creation
python models/body_classifier.py

# Test preprocessing
python utils/preprocessing.py
```

## 📊 Model Details

- **Architecture**: MobileNetV2 (transfer learning)
- **Input**: 224x224 RGB images
- **Output**: 5 body types
- **Accuracy**: 75-85% (after training)

## 🔧 Troubleshooting

**Model not found error**:
- Train model first: `python train/train_model.py`

**Import errors**:
- Install dependencies: `pip install -r requirements.txt`

**Low accuracy**:
- Add more training data (1000+ images per class)
- Increase epochs (30-50)
