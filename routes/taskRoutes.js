// backend/routes/taskRoutes.js
import express from "express";
import TaskGroup from "../models/TaskGroup.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const todayDate = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const timeNowPretty = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

// GET groups (optional ?date=YYYY-MM-DD)
router.get("/groups", verifyToken, async (req, res) => {
  try {
    const q = { userId: req.user._id };
    if (req.query.date) q.date = req.query.date;
    const groups = await TaskGroup.find(q).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE group (optional date in body)
router.post("/groups", verifyToken, async (req, res) => {
  try {
    const date = req.body.date || todayDate();
    const newGroup = new TaskGroup({ userId: req.user._id, date, tasks: [] });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE group
router.delete("/groups/:groupId", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    await TaskGroup.findOneAndDelete({ _id: groupId, userId: req.user._id });
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// SET time value (timeIn/timeOut/break)
router.put("/groups/:groupId/time", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { type } = req.body;
    if (!["timeIn", "timeOut", "break"].includes(type)) return res.status(400).json({ message: "Invalid type" });

    const value = timeNowPretty();
    const update = {};
    if (type === "timeIn") update.timeIn = value;
    else if (type === "timeOut") update.timeOut = value;
    else update.breakTime = value;

    const updated = await TaskGroup.findOneAndUpdate({ _id: groupId, userId: req.user._id }, { $set: update }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD task
router.post("/groups/:groupId/tasks", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const task = {
      name: req.body.name || "",
      timing: req.body.timing || "",
      issue: req.body.issue || "",
      status: req.body.status || "",
    };
    const updated = await TaskGroup.findOneAndUpdate({ _id: groupId, userId: req.user._id }, { $push: { tasks: task } }, { new: true });
    res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE single task
router.delete("/groups/:groupId/tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { groupId, taskId } = req.params;
    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// BULK delete tasks by ids
router.put("/groups/:groupId/tasks/delete", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { selectedTasks } = req.body;
    if (!Array.isArray(selectedTasks)) return res.status(400).json({ message: "Invalid payload" });

    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id },
      { $pull: { tasks: { _id: { $in: selectedTasks } } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE a single task (patch) — used for auto-save
router.patch("/groups/:groupId/tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { groupId, taskId } = req.params;
    const updateFields = req.body || {};
    // Use positional update
    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id, "tasks._id": taskId },
      { $set: Object.keys(updateFields).reduce((acc, k) => ({ ...acc, [`tasks.$.${k}`]: updateFields[k] }), {}) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
