console.log('Starting server.js...');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectMongoDB } from './config/database.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { seedAdmin } from './seeds/adminSeed.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB, then seed admin once connection is confirmed open
connectMongoDB();
mongoose.connection.once('open', () => {
    seedAdmin().catch((e) => logger.error('Admin seed error:', e.message));
});


// Middleware
app.use(helmet()); // Security headers
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ar-fashion-advisor.vercel.app',
  'https://stylesync-fashion.vercel.app',
  'https://stylesync-ai-zzuw.onrender.com',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API base URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections — log but do NOT exit
// (third-party libs like @gradio/client emit internal rejections that are non-fatal)
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection (non-fatal):', err?.message || err);
  // Do NOT call process.exit(1) — that crashes the server for client-side lib errors
});

export default app;
