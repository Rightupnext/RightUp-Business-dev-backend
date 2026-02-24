import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Added
    projectName: { type: String, required: true },
    projectType: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    requirements: { type: String },
    requirementFiles: [{ type: String }], // ✅ Added to store file paths/URLs
    status: {
      type: String,
      enum: ["Inprogress", "Completed"],
      default: "Inprogress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
