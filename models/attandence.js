import mongoose from "mongoose";

const TaskGroupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: String, // YYYY-MM-DD
    required: true
  },

  timeIn: {
    type: Date,
    required: true
  },

  timeOut: {
    type: Date
  },

  // Breaks (used ONLY to subtract time)
  breaks: {
    mg: {
      in: Date,
      out: Date
    },
    lunch: {
      in: Date,
      out: Date
    },
    evening: {
      in: Date,
      out: Date
    }
  },

  // 🔥 Calculated value (stored for reports)
  totalWorkingMs: {
    type: Number, // milliseconds
    default: 0
  },

  tasks: {
    type: [TaskSchema],
    default: []
  }

}, { timestamps: true });
export default mongoose.model("TaskGroup", TaskGroupSchema);