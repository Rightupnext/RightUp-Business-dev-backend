import Permission from "../models/Permission.js";

/**
 * =========================
 * GET – All permissions (logged-in user)
 * =========================
 */
export const getPermissions = async (req, res) => {
  try {
    const data = await Permission.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};

/**
 * =========================
 * GET – Monthly permissions (for Monthly Report)
 * =========================
 * URL: /permissions/monthly/:userId/:month/:year
 */
export const getMonthlyPermissions = async (req, res) => {
  try {
    const { userId, month, year } = req.params;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const permissions = await Permission.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly permissions" });
  }
};

/**
 * =========================
 * CREATE – Add permission
 * =========================
 */
export const createPermission = async (req, res) => {
  try {
    const permission = await Permission.create({
      user: req.user.id,
      date: req.body.date,
      permissionIn: "",
      permissionOut: "",
      reason: "",
    });

    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: "Failed to create permission" });
  }
};

/**
 * =========================
 * UPDATE – Permission In / Out / Reason
 * =========================
 */
export const updatePermission = async (req, res) => {
  try {
    const updated = await Permission.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update permission" });
  }
};

/**
 * =========================
 * DELETE – Permission
 * =========================
 */
export const deletePermission = async (req, res) => {
  try {
    await Permission.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete permission" });
  }
};
