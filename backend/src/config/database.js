import mongoose from 'mongoose';
import pkg from 'pg';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

const { Pool } = pkg;

// MongoDB Connection
export const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.error('❌ MONGODB_URI is not defined in .env file');
      // process.exit(1); // Optional: Exit if DB is critical
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arfashion';
    const conn = await mongoose.connect(uri);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️ Continuing without MongoDB in development mode');
    }
  }
};

// PostgreSQL Connection Pool
export const pgPool = new Pool({
  connectionString: process.env.POSTGRESQL_URI,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pgPool.on('connect', () => {
  logger.info('✅ PostgreSQL Connected');
});

pgPool.on('error', (err) => {
  logger.error('❌ PostgreSQL Error:', err);
});

// Redis Client
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  logger.info('✅ Redis Connected');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis Error:', err);
});

// Connect Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(`❌ Redis Connection Error: ${error.message}`);
  }
};

// Initialize all database connections
export const initializeDatabases = async () => {
  await connectMongoDB();
  await connectRedis();
  // PostgreSQL connects automatically via pool
};

export default {
  mongoose,
  pgPool,
  redisClient,
  connectMongoDB,
  connectRedis,
  initializeDatabases,
};
