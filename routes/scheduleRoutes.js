// routes/scheduleRoutes.js

import express from "express";
import Schedule from "../models/Schedule.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


// CREATE SCHEDULE
router.post("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    const payload = {
      ...req.body,
      createdBy: user._id,
      dashboardType: user.dashboardType,
    };

    // project dashboard -> self assign
    if (user.dashboardType === "project") {
      payload.assignedTo = user._id;
    }

    const schedule = await Schedule.create(payload);

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      schedule,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// GET ALL SCHEDULES
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    let query = {};

    if (user.dashboardType === "project") {
      query.assignedTo = user._id;
    }

    if (user.dashboardType === "business") {
      query.createdBy = user._id;
    }

    const schedules = await Schedule.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      schedules,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// GET SINGLE SCHEDULE
router.get("/:id", verifyToken, async (req, res) => {
  try {

    const schedule = await Schedule.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      schedule,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// UPDATE SCHEDULE
router.patch("/:id", verifyToken, async (req, res) => {
  try {

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      schedule,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// DELETE SCHEDULE
router.delete("/:id", verifyToken, async (req, res) => {
  try {

    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// PROJECT REPORT ROUTE
router.get("/report/:projectId", verifyToken, async (req, res) => {
  try {

    const { projectId } = req.params;

    const schedules = await Schedule.find({
      projectId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ scheduleDate: -1 });

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;