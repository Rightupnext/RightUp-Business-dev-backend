import express from "express";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import TaskGroup from "../models/TaskGroup.js";

const router = express.Router();

router.get("/users", verifyToken, async (req, res) => {
  try {
    const projectUsers = await User.find({ role: "project" }).select("name email _id role dashboardType").sort({ name: 1 }) || [] ;
    
  
    res.json(projectUsers);
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
// REPORT ROUTE (FULL UPDATED VERSION)

router.get("/report/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // =========================
    // PROJECT
    // =========================
    const project = await Project.findById(projectId).populate(
      "user",
      "name email role"
    );

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    // =========================
    // TASK GROUPS
    // =========================
    const taskGroups = await TaskGroup.find({
      "tasks.projectId": projectId,
    }).populate("userId", "name email role");

    // =========================
    // HELPERS
    // =========================

    // overlap break mins inside task timing
    const overlapMinutes = (
      taskStart,
      taskEnd,
      breakStart,
      breakEnd
    ) => {
      if (!taskStart || !taskEnd || !breakStart || !breakEnd)
        return 0;

      const start = Math.max(
        new Date(taskStart).getTime(),
        new Date(breakStart).getTime()
      );

      const end = Math.min(
        new Date(taskEnd).getTime(),
        new Date(breakEnd).getTime()
      );

      return end > start ? (end - start) / 60000 : 0;
    };

    // format mins => 3h 20m
    const formatMinutes = (mins) => {
      if (!mins || mins <= 0) return "0m";

      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);

      if (mins < 60) return `${m}m`;

      if (m === 0) return `${h}h`;

      return `${h}h ${m}m`;
    };

    // =========================
    // REPORTS
    // =========================

    const reports = [];

    taskGroups.forEach((group) => {
      group.tasks.forEach((task) => {
        if (
          task.projectId &&
          task.projectId.toString() === projectId
        ) {
          const taskStart = task.timing;
          const taskEnd = task.endTiming;

          let totalMinutes = 0;
          let breakMinutes = 0;

          // =========================
          // TASK TOTAL TIME
          // =========================
          if (
            taskStart &&
            taskEnd &&
            taskEnd !== ""
          ) {
            totalMinutes =
              (new Date(taskEnd) - new Date(taskStart)) /
              60000;

            // =========================
            // MG BREAK
            // =========================
            breakMinutes += overlapMinutes(
              taskStart,
              taskEnd,
              group.MGBreakIn,
              group.MGBreakOut
            );

            // =========================
            // LUNCH BREAK
            // =========================
            breakMinutes += overlapMinutes(
              taskStart,
              taskEnd,
              group.LunchbreakIn,
              group.LunchbreakOut
            );

            // =========================
            // EVENING BREAK
            // =========================
            breakMinutes += overlapMinutes(
              taskStart,
              taskEnd,
              group.EveBreakIn,
              group.EveBreakOut
            );
          }

          // =========================
          // FINAL EFFECTIVE TIME
          // =========================
          const effectiveMinutes = Math.max(
            totalMinutes - breakMinutes,
            0
          );

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

              // =========================
              // TIME DETAILS
              // =========================
              totalDurationMinutes:
                Math.round(totalMinutes),

              breakDurationMinutes:
                Math.round(breakMinutes),

              effectiveDurationMinutes:
                Math.round(effectiveMinutes),

              totalDuration:
                formatMinutes(totalMinutes),

              breakDuration:
                formatMinutes(breakMinutes),

              effectiveDuration:
                formatMinutes(effectiveMinutes),
            },
          });
        }
      });
    });

    // =========================
    // RESPONSE
    // =========================
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
});
export default router;