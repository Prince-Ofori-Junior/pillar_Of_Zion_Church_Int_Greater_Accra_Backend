import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = (fileBuffer, folder = '', options = {}, originalName = 'file') => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName).toLowerCase();
    let resource_type = 'image';
    if (['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) resource_type = 'video';
    else if (['.mp3', '.wav', '.ogg'].includes(ext)) resource_type = 'video';

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type, public_id: path.basename(originalName, ext), ...options },
      (error, result) => { if (error) return reject(error); resolve(result); }
    );

    uploadStream.end(fileBuffer);
  });
};
  