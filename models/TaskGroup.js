import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  projname: { type: String, default: "" }, // project name
  name: { type: String, default: "" },  
  timing: { type: String, default: "" }, // auto-filled current time
  issue: { type: String, default: "" },
  endTiming :{ type: String, default: "" },
  status: { type: String, default: "" },
   images: { type: [String], default: [] }, 
}, { timestamps: true });

const TaskGroupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeIn: { type: String, default: "" },
  timeOut: { type: String, default: "" },
  MGBreakIn: { type: String, default: "" },
  MGBreakOut: { type: String, default: "" },
  LunchbreakIn: { type: String, default: "" },
  LunchbreakOut: { type: String, default: "" },
  EveBreakIn: { type: String, default: "" },
  EveBreakOut: { type: String, default: "" },
  tasks: { type: [TaskSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("TaskGroup", TaskGroupSchema);
