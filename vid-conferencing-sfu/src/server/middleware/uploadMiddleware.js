// uploadMiddleware.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: "ds0l43vlz",
  api_key: "554941235224926",
  api_secret: "DGYysFwGaOMczyPV0KGdxCKA0E4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    console.log('Received file:', file.fieldname);
    let folder;
    
    if (req.originalUrl.includes('create-course')) {
      folder = 'courses';
    } else if (req.originalUrl.includes('photo')) {
      folder = 'photos';
    } else {
      folder = 'uploads';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'pdf', 'mp4','webp'],
      resource_type: 'auto',
    };
  }
});

// Multer configuration with Cloudinary storage
const upload = multer({ storage: storage });

export { upload };
