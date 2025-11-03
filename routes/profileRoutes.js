import express from "express";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ✅ Upload Configuration
const storage = multer.diskStorage({
  destination: "uploads/profile",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ Get Profile + User Auth Details
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email");
    const profile = await Profile.findOne({ userId: req.user._id });

    res.json({
      ...user._doc,
      ...profile?._doc,
      profileImage: profile?.profileImage || "",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update / Create Profile
router.put(
  "/update",
  verifyToken,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updateData = req.body;
      if (req.file) {
        updateData.profileImage = req.file.path;
      }

      const updatedProfile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        updateData,
        { new: true, upsert: true }
      );

      res.json(updatedProfile);
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ✅ Get All Project Role Users
router.get("/all-project-users", verifyToken, async (req, res) => {
  try {
    // Find all users with role = "project"
    const projectUsers = await User.find({ role: "project" }).select("name email _id");

    // Get all profiles belonging to those users
    const profiles = await Profile.find({
      userId: { $in: projectUsers.map((u) => u._id) },
    });

    // Merge User + Profile data
    const result = projectUsers.map((user) => {
      const profile = profiles.find(
        (p) => p.userId.toString() === user._id.toString()
      );
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: profile?.employeeId || "",
        emp_role: profile?.emp_role || "",
        address: profile?.address || "",
        bloodGroup: profile?.bloodGroup || "",
        profileImage: profile?.profileImage || "",
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching project users:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
