import express from "express";
import TaskGroup from "../models/TaskGroup.js";

const router = express.Router();

/**
 * @route GET /reports/monthly/:userId/:month/:year
 * @desc Get monthly attendance for a user
 */
router.get("/monthly/:userId/:month/:year", async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Fetch all TaskGroups for that user
    const allReports = await TaskGroup.find({ userId });

    // Filter reports that belong to selected month & year
    const filtered = allReports.filter((r) => {
      if (!r.date) return false;
      const [y, m, d] = r.date.split("-").map(Number);
      return y === yearNum && m === monthNum;
    });

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching monthly report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
