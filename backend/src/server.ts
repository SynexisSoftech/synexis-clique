import express, { Application, Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; // ✅ Import auth routes
import { setupSwagger } from '../swagger'; // ✅ Import Swagger setup
import cors from 'cors';
import contactUsRoutes from './routes/contactus.routes';
 // Add this line to import category routes

dotenv.config();

console.log('Loaded env vars:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

console.log('cwd:', process.cwd());

const app: Application = express();
const PORT: string | number = process.env.PORT || 3001;
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/default_db';

const corsOptions = {
  origin: 'http://localhost:3000', // <-- IMPORTANT: Change to your Next.js URL
  credentials: true, // <-- IMPORTANT: Allow sending cookies (for refreshToken)
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactUsRoutes);


setupSwagger(app); // ✅ Mount Swagger UI at /api-docs

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Auth System Backend is running!',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

const server = http.createServer(app);

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('FATAL ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Successfully connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT} , clique backend working`);
      console.log(`📘 Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error connecting to MongoDB or starting server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close(false);
  console.log('MongoDB connection closed.');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

startServer();

export default app;