import cloudinary from "../config/cloudinary.js";
import ProjectHoliday from "../models/ProjectHoliday.js";
import streamifier from "streamifier";


// Upload Image
export const uploadHolidayImage = async (req, res) => {
  try {
    const streamUpload = (req) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ProjectHolidays" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload(req);

    const newImage = await ProjectHoliday.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.json(newImage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Images
export const getHolidayImages = async (req, res) => {
  const images = await ProjectHoliday.find().sort({ createdAt: -1 });
  res.json(images);
};


// Delete Image
export const deleteHolidayImage = async (req, res) => {
  try {
    const image = await ProjectHoliday.findById(req.params.id);

    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
