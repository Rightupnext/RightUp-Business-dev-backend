import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // make sure role always exists
   dashboardType: {
    type: String,
    enum: ["business", "project"],
    required: true,
  },

  dashboardData: {
    type: Object,
    default: {
      cards: [
        { title: "Team Members" },
        { title: "Websites" },
        { title: "Digital Marketing" },
      ],
      clients: [],
      members: [],
    },
  },
});

export default mongoose.model("User", userSchema);
