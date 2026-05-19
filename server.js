// backend/server.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import projectHolidayRoutes from "./routes/projectHolidayRoutes.js";
import analyticsReportRoutes from "./routes/analyticsReportRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";

import startImageCleanupJob from "./utils/imageCleanup.js";

import { initSocket } from "./socket/socket.js";

const app = express();


// =======================================
// MIDDLEWARE
// =======================================
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());


// =======================================
// HTTP SERVER
// =======================================
const server = http.createServer(app);


// =======================================
// SOCKET INIT
// =======================================
initSocket(server);


// =======================================
// START CRON
// =======================================
startImageCleanupJob();


// =======================================
// DATABASE
// =======================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("✅ MongoDB connected")
  )
  .catch((err) =>
    console.error("❌ DB Error:", err)
  );


// =======================================
// STATIC FILES
// =======================================
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);


// =======================================
// TEST API
// =======================================
app.get("/", (req, res) => {
  res.send("API is running ✅");
});


// =======================================
// ROUTES
// =======================================
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/permissions", permissionRoutes);
app.use("/reports", reportRoutes);
app.use(
  "/project-holidays",
  projectHolidayRoutes
);
app.use(
  "/analytics",
  analyticsReportRoutes
);
app.use("/schedules", scheduleRoutes);


// =======================================
// SERVER START
// =======================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `✅ Server running on port ${PORT}`
  );
});