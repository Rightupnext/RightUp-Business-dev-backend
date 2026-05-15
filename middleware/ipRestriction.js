// middleware/ipRestriction.js

export const restrictProjectIP = (req, res, next) => {
  try {
    const user = req.user;

    // =========================
    // BUSINESS USERS
    // =========================
    if (user.dashboardType === "business") {
      return next();
    }

    // =========================
    // PROJECT USERS
    // =========================
    if (user.dashboardType === "project") {

      // allow all networks
      if (user.freeWifiAccess === true) {
        return next();
      }

      // office wifi public ip
      const allowedIP =
        process.env.ALLOWED_PROJECT_IP;

      // real client ip
      let clientIP =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        req.ip ||
        "";

      // multiple proxy ips
      if (clientIP.includes(",")) {
        clientIP =
          clientIP.split(",")[0].trim();
      }

      // normalize
      clientIP =
        clientIP.replace("::ffff:", "");

      console.log("CLIENT IP:", clientIP);

      // =========================
      // LOCAL DEV ALLOW
      // =========================
      if (
        process.env.NODE_ENV !==
          "production" &&
        (
          clientIP === "::1" ||
          clientIP === "127.0.0.1"
        )
      ) {
        return next();
      }

      // =========================
      // OFFICE WIFI ALLOW
      // =========================
      if (clientIP === allowedIP) {
        return next();
      }

      // =========================
      // BLOCK
      // =========================
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only office WiFi allowed.",
        yourIP: clientIP,
      });
    }

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};