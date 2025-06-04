// // src/config/db.ts
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const MONGODB_URI: string = process.env.MONGODB_URI ;

// const connectDB = async (): Promise<void> => {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('🔌 Successfully connected to MongoDB');
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//     process.exit(1);
//   }
// };

// export default connectDB;
