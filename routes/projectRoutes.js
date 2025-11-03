import express from "express";
import Project from "../models/Project.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/** ✅ Create Project */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { projectName, projectType, startDate, endDate, requirements, status } = req.body;

    if (!projectName || !projectType)
      return res.status(400).json({ message: "Project name and type are required" });

    const project = new Project({
      user: req.user.id,
      projectName,
      projectType,
      startDate,
      endDate,
      requirements,
      status,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Get all projects for logged-in user */
router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Get projects by card type (Website, App, Digital Marketing) */
router.get("/category/:type", verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    if (!type) return res.status(400).json({ message: "Project type required" });

    // Dynamic regex match (e.g., "Website" → matches "Website Development")
    const regex = new RegExp(type, "i");

    const projects = await Project.find({
      user: req.user.id,
      projectType: { $regex: regex },
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Update project */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Delete project */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Get profile by user ID */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("name email");
    const profile = await Profile.findOne({ userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user._doc,
      ...profile?._doc,
      profileImage: profile?.profileImage || "",
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Get projects created by a specific user (for admin viewing) */
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find all projects that belong to the given userId
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects for user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
