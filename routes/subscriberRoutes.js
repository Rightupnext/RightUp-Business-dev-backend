import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const { userId, subscriberId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.pushifySubscriberId = subscriberId;
    await user.save();

    res.json({ success: true, message: "Subscriber ID saved successfully" });
  } catch (err) {
    console.error("Save subscriber error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
