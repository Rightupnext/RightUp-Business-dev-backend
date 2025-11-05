import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
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

/** ✅ Get ALL projects (Admin Dashboard View) */
router.get("/", verifyToken, async (req, res) => {
  try {
    // ✅ Fetch all projects from all users and populate user details
    const projects = await Project.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Get projects by type */
router.get("/category/:type", verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const regex = new RegExp(type, "i");

    const projects = await Project.find({
      projectType: { $regex: regex },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Update Project */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/** ✅ Delete Project */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
