// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import projectHolidayRoutes from "./routes/projectHolidayRoutes.js";
import path from "path";
import startImageCleanupJob from "./utils/imageCleanup.js";

const app = express();
// ... (previous code)

// ✅ Start Cleanup Cron Job
startImageCleanupJob();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ✅ Static File Serving
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.get("/", (req, res) => {
  res.send("API is running ✅");
});
// ✅ API Routes
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/permissions", permissionRoutes);
app.use("/reports", reportRoutes);
app.use("/project-holidays", projectHolidayRoutes);
app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on ${process.env.PORT}`)
);
