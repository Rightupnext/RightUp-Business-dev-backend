// routes/tasks.js
import express from "express";
import fileUpload from "express-fileupload";
import streamifier from "streamifier";
import { verifyToken } from "../middleware/auth.js";
import TaskGroup from "../models/TaskGroup.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ✅ Enable file uploads (no multer)
router.use(
  fileUpload({
    useTempFiles: false,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  })
);

// ✅ Helper functions — no timezone formatting
const todayDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10); // always in UTC (YYYY-MM-DD)
};

const timeNowRaw = () => {
  const now = new Date();
  return now.toISOString().split("T")[1].slice(0, 8); // HH:mm:ss (24-hour)
};

/* -------------------------------------------------------------------------- */
/* ✅ 1. GET groups for Logged-in User                                        */
/* -------------------------------------------------------------------------- */
router.get("/groups", verifyToken, async (req, res) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.date) query.date = req.query.date;
    const groups = await TaskGroup.find(query).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("Error fetching self task groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 2. GET groups for ANY User (Admin View)                                 */
/* -------------------------------------------------------------------------- */
router.get("/groups/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const query = { userId };
    if (req.query.date) query.date = req.query.date;
    const groups = await TaskGroup.find(query).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("Error fetching user task groups:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 3. Create new task group (self)                                         */
/* -------------------------------------------------------------------------- */
router.post("/groups", verifyToken, async (req, res) => {
  try {
    const date = req.body.date || todayDate();
    const newGroup = new TaskGroup({
      userId: req.user._id,
      date,
      tasks: [],
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 4. Delete a task group                                                  */
/* -------------------------------------------------------------------------- */
router.delete("/groups/:groupId", verifyToken, async (req, res) => {
  try {
    await TaskGroup.findOneAndDelete({
      _id: req.params.groupId,
      userId: req.user._id,
    });
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 5. Update group time fields (no timezone formatting)                    */
/* -------------------------------------------------------------------------- */
router.put("/groups/:groupId/time", verifyToken, async (req, res) => {
  try {
    const { type } = req.body;
    const valid = [
      "timeIn",
      "MGBreakIn",
      "MGBreakOut",
      "LunchbreakIn",
      "LunchbreakOut",
      "EveBreakIn",
      "EveBreakOut",
      "timeOut",
    ];
    if (!valid.includes(type))
      return res.status(400).json({ message: "Invalid time type" });

    const group = await TaskGroup.findOne({
      _id: req.params.groupId,
      userId: req.user._id,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group[type])
      return res.status(400).json({ message: "Already recorded" });

    group[type] = timeNowRaw(); // save UTC HH:mm:ss
    await group.save();
    res.json(group);
  } catch (err) {
    console.error("Time update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 6. Add new task                                                        */
/* -------------------------------------------------------------------------- */
router.post("/groups/:groupId/tasks", verifyToken, async (req, res) => {
  try {
    const now = timeNowRaw();
    const task = {
      projname: "",
      name: "",
      timing: now,
      issue: "",
      status: "",
      images: [],
    };
    const updated = await TaskGroup.findOneAndUpdate(
      { _id: req.params.groupId, userId: req.user._id },
      { $push: { tasks: task } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Add task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 7. Update task fields (inline edit)                                     */
/* -------------------------------------------------------------------------- */
router.patch("/groups/:groupId/tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { groupId, taskId } = req.params;
    const updateFields = req.body;

    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id, "tasks._id": taskId },
      {
        $set: Object.entries(updateFields).reduce(
          (acc, [key, val]) => ({ ...acc, [`tasks.$.${key}`]: val }),
          {}
        ),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 8. Upload task image (Direct Cloudinary)                               */
/* -------------------------------------------------------------------------- */
router.post(
  "/groups/:groupId/tasks/:taskId/images",
  verifyToken,
  async (req, res) => {
    try {
      const { groupId, taskId } = req.params;
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imageFile = req.files.image;

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "task-images" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        streamifier.createReadStream(imageFile.data).pipe(stream);
      });

      const updated = await TaskGroup.findOneAndUpdate(
        { _id: groupId, userId: req.user._id, "tasks._id": taskId },
        { $push: { "tasks.$.images": uploadResult.secure_url } },
        { new: true }
      );

      res.json(updated);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* ✅ 9. Delete task image                                                   */
/* -------------------------------------------------------------------------- */
router.delete("/groups/:groupId/tasks/:taskId/images", verifyToken, async (req, res) => {
  try {
    const { groupId, taskId } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Missing URL" });

    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id, "tasks._id": taskId },
      { $pull: { "tasks.$.images": imageUrl } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Image delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 10. Delete task only                                                   */
/* -------------------------------------------------------------------------- */
router.delete("/groups/:groupId/tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { groupId, taskId } = req.params;
    const updated = await TaskGroup.findOneAndUpdate(
      { _id: groupId, userId: req.user._id },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Task delete failed" });
  }
});
router.put("/groups/:groupId/endtime", verifyToken, async (req, res) => {
  try {
    const group = await TaskGroup.findOne({
      _id: req.params.groupId,
      userId: req.user._id,
    });

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.endTiming) 
      return res.status(400).json({ message: "Already recorded" });

    const now = new Date()
      .toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

    group.endTiming = now;
    await group.save();

    res.json(group);
  } catch (err) {
    console.error("End time error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
