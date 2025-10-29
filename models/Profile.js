import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  emp_role: { type: String, required: true },
  address: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  profileImage: { type: String }, // ✅ Not required for new users
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("Profile", profileSchema);
