
import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

export const uploadImageToCloudinary = async (base64Image: string, folder: string = 'user_photos'): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
      folder: folder,
      // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Example transformation
    });
    return result.secure_url;
    // console.log('[Cloudinary Service] Image upload called. Returning placeholder URL.');
    return `https://via.placeholder.com/150/0000FF/808080?Text=UserPhoto_${Date.now()}`; // Placeholder
  } catch (error) {
    console.error('[Cloudinary Service] Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed.');
  }
};