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

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ✅ Static File Serving
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("API is running ✅");
});
// ✅ API Routes
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/reports", reportRoutes);
app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on ${process.env.PORT}`)
);
