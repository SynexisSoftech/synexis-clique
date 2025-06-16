import express, { Application, Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; // ✅ Import auth routes
import { setupSwagger } from '../swagger'; // ✅ Import Swagger setup
import cors from 'cors';
import contactUsRoutes from './routes/contactus.routes';
 // Add this line to import category routes
import adminRouter from './routes/admin/admin.routes';
import publicCategoryRoutes from './routes/public/publicCategory.routes';
import publicSubcategoryRoutes from './routes/public/subcategory.public.routes';
import publicProductRoutes from './routes/public/publicproduct.routes';
import socialLinkAdminRoutes from './routes/admin/socialLink.routes';
import publicSocialLinksRoutes from './routes/public/publicsociallinks.route';
import adminHeroRoutes from './routes/admin/adminHero.routes'; // Adjust path as needed
import publicHeroRoutes from './routes/public/hero.routes';
import contactInfoAdminRoutes from './routes/admin/contactinfo.routes'; 
import publicContactInfoRoutes from './routes/public/publiccontactinfo.route';
import adminReviewRoutes from './routes/admin/adminReview.routes';
import publicReviewRoutes from './routes/public/review.routes';
import adminOrderRoutes from './routes/admin/order.routes';
import userOrderRoutes from './routes/public/order.routes';
import publicCartRoutes from './routes/public/cart.route'; // Adjust path if needed
import adminCartRoutes from './routes/admin/cart.route'; 
import userRoutes from './routes/admin/user.routes';
import cookieParser from 'cookie-parser';
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
   methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactUsRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicCategoryRoutes);
app.use('/api/public/subcategories', publicSubcategoryRoutes);
app.use('/api/public/products', publicProductRoutes);
app.use('/api/admin/social-links', socialLinkAdminRoutes);
app.use('/api/social-links', publicSocialLinksRoutes);
app.use('/api/admin/hero-slides', adminHeroRoutes);
app.use('/api/admin/contact-info', contactInfoAdminRoutes);
app.use('/api/contact-info', publicContactInfoRoutes);

// For Public data fetching (e.g., /api/hero-slides)
app.use('/api/hero-slides', publicHeroRoutes);
app.use('/api/admin/reviews', adminReviewRoutes); // Admin review routes
app.use('/api/products', publicReviewRoutes); // Public review routes (nested under products)
app.use('/api/admin/orders', adminOrderRoutes); // <-- ADD THIS
app.use('/api/cart', publicCartRoutes);

// Mount the admin cart routes
// Requests to /api/admin/carts, /api/admin/carts/:id will be handled by this router
app.use('/api/admin/carts', adminCartRoutes);

// ... app.use('/api/products', publicProductRoutes);
app.use('/api/orders', userOrderRoutes); // <-- AND ADD THIS
app.use('/api/admin', userRoutes);
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