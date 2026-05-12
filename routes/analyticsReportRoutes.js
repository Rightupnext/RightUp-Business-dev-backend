import express from "express";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import TaskGroup from "../models/TaskGroup.js";

const router = express.Router();

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name email role dashboardType"
    ).sort({ name: 1 });

    res.json(users);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});
router.get(
  "/projects/:userId",
  verifyToken,
  async (req, res) => {
    try {
      const projects = await Project.find({
        user: req.params.userId,
      }).sort({ createdAt: -1 });

      res.json(projects);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to fetch projects",
      });
    }
  }
);
router.get(
  "/report/:projectId",
  verifyToken,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      // Project
      const project = await Project.findById(projectId)
        .populate("user", "name email role");

      if (!project) {
        return res.status(404).json({
          error: "Project not found",
        });
      }

      // Task Groups
      const taskGroups = await TaskGroup.find({
        "tasks.projectId": projectId,
      }).populate("userId", "name email role");

      // Flatten Tasks
      const reports = [];

      taskGroups.forEach((group) => {
        group.tasks.forEach((task) => {
          if (
            task.projectId &&
            task.projectId.toString() === projectId
          ) {
            reports.push({
              groupId: group._id,

              user: {
                id: group.userId?._id,
                name: group.userId?.name,
                email: group.userId?.email,
                role: group.userId?.role,
              },

              project: {
                id: project._id,
                projectName: project.projectName,
                projectType: project.projectType,
                status: project.status,
              },

              date: group.date,

              task: {
                id: task._id,
                projectId: task.projectId,
                projname: task.projname,
                name: task.name,
                timing: task.timing,
                endTiming: task.endTiming,
                issue: task.issue,
                status: task.status,
                images: task.images,
              },
            });
          }
        });
      });

      res.json({
        user: project.user,
        project,
        totalTasks: reports.length,
        reports,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to fetch analytics report",
      });
    }
  }
);
export default router;