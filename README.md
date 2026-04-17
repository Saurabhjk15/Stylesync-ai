# AR Fashion Advisor

> Virtual Try-On & Style Recommendation System using AI and AR

## 📋 Project Overview

A web application that helps users discover clothing styles that suit their body type using computer vision, AI recommendations, and augmented reality try-on.

### Key Features
- 🎥 **Body Scanning** - AI-powered body measurement extraction
- 🧠 **Smart Recommendations** - Personalized outfit suggestions based on body type
- 👗 **AR Try-On** - Real-time virtual clothing visualization
- ❤️ **Save Favorites** - Bookmark and track liked outfits
- 🛍️ **Shopping Integration** - Direct links to purchase items

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Redux Toolkit
- MediaPipe Pose
- Three.js (for AR)
- Axios

### Backend
- Node.js + Express
- MongoDB (user data)
- PostgreSQL (product catalog)
- Redis (caching)
- JWT Authentication

### ML Service
- Python + Flask
- TensorFlow
- MediaPipe
- OpenCV

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB
- PostgreSQL
- Redis (optional but recommended)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/ar-fashion-advisor.git
cd ar-fashion-advisor
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
\`\`\`

Frontend will run on `http://localhost:3000`

### 3. Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URLs and secrets
npm run dev
\`\`\`

Backend will run on `http://localhost:8080`

### 4. ML Service Setup (Optional for initial development)
\`\`\`bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
\`\`\`

ML Service will run on `http://localhost:5000`

## 📁 Project Structure

\`\`\`
ar-fashion-advisor/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # State management
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── .env.example
├── ml-service/              # Python ML service
│   ├── models/              # ML models
│   ├── utils/               # Helper functions
│   ├── app.py               # Flask app
│   └── requirements.txt
└── docs/                    # Documentation
\`\`\`

## 🗄️ Database Setup

### MongoDB
\`\`\`bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally from mongodb.com
\`\`\`

### PostgreSQL
\`\`\`bash
# Using Docker
docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=password postgres:15

# Or install locally from postgresql.org
\`\`\`

### Redis (Optional)
\`\`\`bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Or install locally from redis.io
\`\`\`

## 🔑 Environment Variables

### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
\`\`\`

### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/arfashion
POSTGRESQL_URI=postgresql://localhost:5432/arfashion
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this
FRONTEND_URL=http://localhost:3000
\`\`\`

## 📚 API Documentation

API docs available at `/api/docs` when server is running (coming soon)

## 🧪 Testing

### Frontend Tests
\`\`\`bash
cd frontend
npm test
npm run test:coverage
\`\`\`

### Backend Tests
\`\`\`bash
cd backend
npm test
\`\`\`

## 📦 Deployment

### Frontend (Vercel)
\`\`\`bash
cd frontend
npm run build
vercel --prod
\`\`\`

### Backend (Heroku)
\`\`\`bash
cd backend
heroku create arfashion-api
git push heroku main
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License

## 👥 Team

- Your Name - Full Stack Development
- Team Member 2 - Frontend Development
- Team Member 3 - ML Development

## 🎓 Academic Project

This is a college final year project for [Your College Name]
- Course: B.Tech Computer Science
- Year: 2025-2026
- Guide: Prof. [Name]

## 📞 Contact

For questions or support, please email: your.email@example.com

---

**Made with ❤️ by [Your Team Name]**
