import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    scheduleDate: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending",
    },

    dashboardType: {
      type: String,
      enum: ["business", "project"],
      required: true,
    },

    // creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // assigned employee/user
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    attachments: [
      {
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Schedule", scheduleSchema);