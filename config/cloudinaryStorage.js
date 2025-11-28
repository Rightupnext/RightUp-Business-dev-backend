import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "./cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  const stream = cloudinary.uploader.upload_stream(
    { folder: "profile_images", transformation: [{ width: 400, height: 400, crop: "fill" }] },
    (error, result) => {
      if (error) return next(error);
      req.file.cloudinaryUrl = result.secure_url;
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

export { upload, uploadToCloudinary };
