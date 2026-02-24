import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    permissionIn: String,
    permissionOut: String,
    reason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Permission", permissionSchema);
