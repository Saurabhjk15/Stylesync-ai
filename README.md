# StyleSync AI

> Your Personal AI Stylist — Virtual Try-On & Intelligent Style Recommendations

[![GitHub](https://img.shields.io/badge/GitHub-Saurabhjk15-black?logo=github)](https://github.com/Saurabhjk15)
[![Instagram](https://img.shields.io/badge/Instagram-saurabh__jk15-E4405F?logo=instagram)](https://instagram.com/saurabh_jk15)
[![X](https://img.shields.io/badge/X-Bose13Jk-000000?logo=x)](https://x.com/Bose13Jk)

## 📋 Project Overview

StyleSync AI is a full-stack web application that combines **computer vision**, **generative AI**, and **virtual try-on** technology to give users a personalized digital wardrobe experience. It scans your body using the camera, generates a Style DNA report via Groq AI, and lets you virtually try on clothing using IDM-VTON.

### ✨ Key Features

- 🎥 **Body Scan** — AI-powered body measurement extraction using MediaPipe Pose
- 🧠 **AI Stylist** — Personalized Style DNA via Groq LLaMA 3.3 70B
- 👗 **Virtual Try-On** — IDM-VTON / LightX powered garment overlay
- 🪞 **Closet** — Save outfits & track your try-on history
- 📦 **Garment Upload** — Upload any clothing image to try on
- 📬 **Contact** — Auto-reply email via Resend API
- 🔐 **Auth** — JWT + Google OAuth with persistent session

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Redux Toolkit
- MediaPipe Pose (body landmark detection)
- Framer Motion (animations)
- Axios

### Backend
- Node.js + Express
- MongoDB (user & product data)
- JWT Authentication
- Resend (email)
- Supabase (image storage)

### AI Services
| Service | Role | Tier |
|---|---|---|
| Groq (LLaMA 3.3) | Style DNA generation | Free |
| IDM-VTON (HuggingFace) | Virtual try-on | Free |
| LightX API | Try-on fallback | Free credits |
| Gemini 2.0 Flash | Recommendation fallback | Free |
| Serper.dev | Clothing search | Free |
| Remove.bg | Background removal | Free (50/mo) |

### ML Service
- Python + Flask
- MediaPipe Pose
- OpenCV
- Hosted on HuggingFace Spaces

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free)

### 1. Clone the Repository
```bash
git clone https://github.com/Saurabhjk15/Stylesync-ai.git
cd Stylesync-ai
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your API keys (see .env.example for all required keys)
npm run dev
```

Backend will run on `http://localhost:8080`

### 4. ML Service Setup (Optional)
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python app.py
```

ML Service will run on `http://localhost:5000`

## 📁 Project Structure

```
Stylesync-ai/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   │   └── mediapipe/pose/      # Local MediaPipe WASM assets
│   └── src/
│       ├── components/
│       │   └── common/          # Navbar, Footer, ErrorBoundary
│       ├── pages/               # All page components
│       │   ├── BodyScan.jsx     # Camera + pose detection
│       │   ├── CPVTONTryOn.jsx  # AI virtual try-on
│       │   ├── Recommendations.jsx  # Groq Style DNA
│       │   ├── SavedOutfits.jsx # Closet + try-on history
│       │   └── Contact.jsx      # Contact form with email
│       ├── redux/               # Redux Toolkit slices & store
│       ├── services/            # API service layer
│       └── utils/               # bodyTypeUtils, helpers
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/              # DB connection
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Auth, error handling
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API endpoints
│   │   │   ├── aiRoutes.js      # IDM-VTON, Style DNA, search
│   │   │   ├── contactRoute.js  # Contact form + Resend email
│   │   │   └── mlRoutes.js      # ML service proxy
│   │   ├── services/            # Groq, Gemini, Supabase, LightX
│   │   └── utils/               # Logger
│   └── .env.example             # All required env vars documented
├── ml-service/                  # Python Flask (HuggingFace Spaces)
│   ├── app.py
│   └── requirements.txt
├── images/                      # App screenshots
└── README.md
```

## 🔑 Environment Variables

See `backend/.env.example` for the full list with setup instructions.

Key variables:
```env
GROQ_API_KEY=               # Free — console.groq.com
RESEND_API_KEY=             # Free — resend.com
SUPABASE_URL=               # Free — supabase.com
LIGHTX_API_KEY=             # Free credits — lightxeditor.com
VTON_PROVIDER=huggingface   # or 'replicate'
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render / Railway)
Set all env vars from `.env.example` in the dashboard, then connect your GitHub repo.

## 📝 License

MIT License — free to use, modify, and distribute.

## 📞 Contact

- **Email:** [saurabhjk6376@gmail.com](mailto:saurabhjk6376@gmail.com)
- **GitHub:** [@Saurabhjk15](https://github.com/Saurabhjk15)
- **Instagram:** [@saurabh_jk15](https://instagram.com/saurabh_jk15)
- **X:** [@Bose13Jk](https://x.com/Bose13Jk)

---

**Made with ❤️ — StyleSync AI**
