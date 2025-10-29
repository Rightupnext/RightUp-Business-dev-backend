// backend/models/TaskGroup.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  timing: { type: String, default: "" },
  issue: { type: String, default: "" },
  status: { type: String, default: "" },
}, { timestamps: true });

const TaskGroupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // e.g. "2025-10-23"
  timeIn: { type: String, default: "" },
  timeOut: { type: String, default: "" },
  breakTime: { type: String, default: "" },
  tasks: { type: [TaskSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("TaskGroup", TaskGroupSchema);
