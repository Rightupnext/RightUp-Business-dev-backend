import express from "express";
import { upload } from "../middleware/multer.js";
import {
  uploadHolidayImage,
  getHolidayImages,
  deleteHolidayImage,
} from "../controller/projectHolidayController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadHolidayImage);
router.get("/", getHolidayImages);
router.delete("/:id", deleteHolidayImage);

export default router;
