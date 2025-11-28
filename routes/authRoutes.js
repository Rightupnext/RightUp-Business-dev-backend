import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, dashboardType } = req.body;

    if (!name || !email || !password || !dashboardType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,            // "business" or "project"
      dashboardType,   // "business" or "project"
    });

    await newUser.save();

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password, dashboardType } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (dashboardType !== user.dashboardType) {
      return res.status(400).json({
        message: "Invalid login area for this user",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    // 🔥 TOKEN WITHOUT EXPIRY (NO expiresIn)
    const token = jwt.sign(
      { id: user._id, role: user.role, dashboardType: user.dashboardType },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dashboardType: user.dashboardType,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});


router.get("/dashboard", verifyToken, (req, res) => {
  const { role } = req.user;

  const dashboards = {
    business: {
      title: "Business Dashboard",
      cards: [
        { title: "Total Projects", count: 14 },
        { title: "Employees", count: 45 },
      ],
    },
    project: {
      title: "Project Dashboard",
      cards: [
        { title: "Assigned Tasks", count: 12 },
        { title: "Completed", count: 7 },
      ],
    },
  };

  res.json({
    dashboardData: dashboards[role] || {
      title: "User Dashboard",
      cards: [],
    },
  });
});

export default router;
