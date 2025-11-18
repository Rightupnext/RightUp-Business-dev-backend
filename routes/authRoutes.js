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
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      role: role || "user",
      dashboardType,
    });

    await newUser.save();

    res.json({ message: "Registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ LOGIN FIXED ✅
router.post("/login", async (req, res) => {
  try {
    const { email, password, dashboardType } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (dashboardType !== user.dashboardType) {
      return res.status(400).json({ message: "Invalid user access area" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, dashboardType: user.dashboardType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
// GET CURRENT USER
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// DASHBOARD (role-based)
router.get("/dashboard", verifyToken, (req, res) => {
  const { role } = req.user;
  let dashboardData = {};

  if (role === "admin") {
    dashboardData = {
      title: "Admin Dashboard",
      cards: [
        { title: "Total Users", count: 25 },
        { title: "Active Projects", count: 8 },
      ],
    };
  } else if (role === "client") {
    dashboardData = {
      title: "Client Dashboard",
      cards: [
        { title: "Active Orders", count: 3 },
        { title: "Invoices", count: 5 },
      ],
    };
  } else {
    dashboardData = {
      title: "User Dashboard",
      cards: [
        { title: "Notifications", count: 2 },
        { title: "Tasks", count: 4 },
      ],
    };
  }

  res.json({ dashboardData });
});

export default router;
