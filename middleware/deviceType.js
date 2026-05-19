import { UAParser } from "ua-parser-js";
import User from "../models/User.js";
import deviceAlertTemplate from "../utils/deviceAlertTemplate.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ========================================
// DETECT DEVICE
// ========================================

export const detectDeviceType = (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"] || "";

    const parser = new UAParser(userAgent);

    const result = parser.getResult();

    req.deviceInfo = {
      type: result.device.type || "desktop",

      vendor: result.device.vendor || "Unknown",
      model: result.device.model || "Unknown",

      browser: result.browser.name || "Unknown",
      browserVersion: result.browser.version || "Unknown",

      os: result.os.name || "Unknown",
      osVersion: result.os.version || "Unknown",

      cpu: result.cpu.architecture || "Unknown",
    };

    console.log("Device Info:", req.deviceInfo);

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Device detection failed",
    });
  }
};

// ========================================
// RESTRICT DEVICE + SEND ALERT MAIL
// ========================================

export const restrictDevice = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deviceType = req.deviceInfo?.type || "desktop";

    console.log("userId:", user._id);
    console.log("deviceAllowed:", user.deviceAllowed);
    console.log("deviceType:", deviceType);

    // ========================================
    // ISSUE DETECTION
    // ========================================

    let issue = "Unknown Mobile Usage";

    const endpoint = req.originalUrl;
    const method = req.method;

    // ========================================
    // ATTENDANCE LOGIN
    // ========================================

    if (endpoint.includes("/groups") && method === "POST") {
      issue = "Attendance Login From Mobile";
    }

    // ========================================
    // TIME UPDATE
    // ========================================
    else if (endpoint.includes("/time") && method === "PUT") {
      const timeType = req.body.type;

      switch (timeType) {
        case "timeIn":
          issue = "Attendance Time-In From Mobile";
          break;

        case "timeOut":
          issue = "Attendance Time-Out From Mobile";
          break;

        case "MGBreakIn":
          issue = "Morning Break-In From Mobile";
          break;

        case "MGBreakOut":
          issue = "Morning Break-Out From Mobile";
          break;

        case "LunchbreakIn":
          issue = "Lunch Break-In From Mobile";
          break;

        case "LunchbreakOut":
          issue = "Lunch Break-Out From Mobile";
          break;

        case "EveBreakIn":
          issue = "Evening Break-In From Mobile";
          break;

        case "EveBreakOut":
          issue = "Evening Break-Out From Mobile";
          break;

        default:
          issue = "Attendance Time Update From Mobile";
      }
    }

    // ========================================
    // END TIME
    // ========================================
    else if (endpoint.includes("/endtime") && method === "PUT") {
      issue = "Attendance End Time From Mobile";
    }

    // ========================================
    // TASK CREATE
    // ========================================
    else if (endpoint.includes("/tasks") && method === "POST") {
      issue = "Task Created From Mobile";
    }

    // ========================================
    // TASK UPDATE
    // ========================================
    else if (endpoint.includes("/tasks") && method === "PATCH") {
      const updatedFields = Object.keys(req.body || {}).join(", ");

      issue = updatedFields
        ? `Task Updated From Mobile (${updatedFields})`
        : "Task Updated From Mobile";
    }

    // ========================================
    // IMAGE UPLOAD
    // ========================================
    else if (endpoint.includes("/images") && method === "POST") {
      issue = "Task Image Uploaded From Mobile";
    }

    // ========================================
    // IMAGE DELETE
    // ========================================
    else if (endpoint.includes("/images") && method === "DELETE") {
      issue = "Task Image Deleted From Mobile";
    }

    // ========================================
    // TASK DELETE
    // ========================================
    else if (endpoint.includes("/tasks") && method === "DELETE") {
      issue = "Task Deleted From Mobile";
    }

    // ========================================
    // MOBILE DETECTION
    // ========================================

    if (
      user.deviceAllowed === false &&
      ["mobile", "tablet"].includes(deviceType)
    ) {
      const clientIP =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown";

      await transporter.sendMail({
        from: process.env.MAIL_USER,

        to: "rightupnext.innovations@gmail.com, sivabalanm205@gmail.com",

        subject: issue,

        html: deviceAlertTemplate({
          name: user.name,
          email: user.email,
          role: user.role,
          deviceType,
          vendor: req.deviceInfo.vendor,
          model: req.deviceInfo.model,
          browser: req.deviceInfo.browser,
          browserVersion: req.deviceInfo.browserVersion,
          os: req.deviceInfo.os,
          osVersion: req.deviceInfo.osVersion,
          ip: clientIP,
          endpoint,
          method,
          issue,
          userAgent: req.headers["user-agent"],
        }),
      });

      console.log("MOBILE DETECTED & MAIL SENT");
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Device restriction failed",
    });
  }
};
