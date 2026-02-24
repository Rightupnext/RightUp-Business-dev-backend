import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getPermissions,
  getMonthlyPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controller/permissionController.js";

const router = express.Router();

/**
 * All permissions (logged-in user)
 */
router.get("/", verifyToken, getPermissions);

/**
 * Monthly permissions (used in MonthlyReport.jsx)
 */
router.get(
  "/monthly/:userId/:month/:year",
  verifyToken,
  getMonthlyPermissions
);

/**
 * Create permission
 */
router.post("/", verifyToken, createPermission);

/**
 * Update permission (in / out / reason)
 */
router.put("/:id", verifyToken, updatePermission);

/**
 * Delete permission
 */
router.delete("/:id", verifyToken, deletePermission);

export default router;
