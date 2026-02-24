import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ Ensure base upload directory exists
const baseUploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder based on route or request property
    const subfolder = req.originalUrl.includes("clients") ? "clients" : "projects";
    const dest = path.join(baseUploadDir, subfolder);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|png|jpg|jpeg/;
  const ext = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (ext) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX, PNG, JPG allowed"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
