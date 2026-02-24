import TaskGroup from "../models/TaskGroup.js";
// import {
//   nowTime12H,
//   calculateWorkingMs,
//   formatMs
// } from "../utils/timeUtils.js";
// Converts "hh:mm AM/PM" to Date object (today)
import {
  nowTime12H,

} from "../utils/timeUtils.js";

// Converts "hh:mm AM/PM" or "HH:mm:ss" to Date object (today)
const toDate = (timeStr) => {
  if (!timeStr) return null;

  const date = new Date();

  // Check if it's 12-hour format with AM/PM
  if (timeStr.includes(" ")) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    date.setHours(hours, minutes, 0, 0);
  } else {
    // 24-hour format "HH:mm:ss"
    const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
    date.setHours(hours, minutes, seconds, 0);
  }

  return date;
};

/**
 * Calculate working hours in real-time (while shift is active)
 * Excludes all break periods: MG Break, Lunch Break, Evening Break
 */
export const calculateWorkingMsLive = (tg) => {
  if (!tg.timeIn) return 0;

  const start = toDate(tg.timeIn);
  const end = tg.timeOut ? toDate(tg.timeOut) : new Date();

  // Total time from Time In to Time Out (or current time)
  let totalMs = end - start;

  // Define all break periods to exclude
  const breaks = [
    { in: tg.MGBreakIn, out: tg.MGBreakOut, name: 'MG Break' },
    { in: tg.LunchbreakIn, out: tg.LunchbreakOut, name: 'Lunch Break' },
    { in: tg.EveBreakIn, out: tg.EveBreakOut, name: 'Evening Break' },
  ];

  // Subtract each break duration from total working time
  breaks.forEach((breakPeriod) => {
    const { in: breakIn, out: breakOut } = breakPeriod;

    if (breakIn && breakOut) {
      // Completed break - subtract full duration
      const breakDuration = toDate(breakOut) - toDate(breakIn);
      totalMs -= breakDuration;
    } else if (breakIn && !breakOut) {
      // Active break (ongoing) - subtract duration till now
      const breakDuration = new Date() - toDate(breakIn);
      totalMs -= breakDuration;
    }
    // If no breakIn, this break period hasn't started yet, so skip
  });

  // Ensure we don't return negative time
  return totalMs > 0 ? totalMs : 0;
};



/**
 * Calculate total working hours for a completed shift
 * Excludes all break periods: MG Break, Lunch Break, Evening Break
 */
export const calculateWorkingMs = (tg) => {
  if (!tg.timeIn || !tg.timeOut) return 0;

  const timeIn = toDate(tg.timeIn);
  const timeOut = toDate(tg.timeOut);

  // Total time from Time In to Time Out
  let totalMs = timeOut - timeIn;

  // Define all break periods to exclude
  const breaks = [
    { in: tg.MGBreakIn, out: tg.MGBreakOut, name: 'MG Break' },
    { in: tg.LunchbreakIn, out: tg.LunchbreakOut, name: 'Lunch Break' },
    { in: tg.EveBreakIn, out: tg.EveBreakOut, name: 'Evening Break' },
  ];

  // Subtract each completed break duration from total working time
  breaks.forEach((breakPeriod) => {
    const { in: breakIn, out: breakOut } = breakPeriod;

    if (breakIn && breakOut) {
      // Both breakIn and breakOut exist - subtract the break duration
      const breakDuration = toDate(breakOut) - toDate(breakIn);
      totalMs -= breakDuration;
    }
    // If break is incomplete (only breakIn without breakOut), 
    // it means the employee forgot to clock out of break,
    // so we don't subtract it to avoid incorrect calculations
  });

  // Ensure we don't return negative time
  return totalMs > 0 ? totalMs : 0;
};

export const formatMs = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

/**
 * Calculate duration of a single break period
 */
export const calculateBreakDuration = (breakIn, breakOut) => {
  if (!breakIn || !breakOut) return 0;

  const start = toDate(breakIn);
  const end = toDate(breakOut);
  const duration = end - start;

  return duration > 0 ? duration : 0;
};

export const handleAttendanceAction = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const now = nowTime12H();

    let tg = await TaskGroup.findOne({ userId, date: today });

    // 🟢 TIME IN
    if (action === "TIME_IN") {


      tg = await TaskGroup.create({
        userId,
        date: today,
        timeIn: now,
      });

      return res.json(tg);
    }

    // All other actions need existing record
    if (!tg) {
      return res.status(400).json({ message: "Please Time In first" });
    }

    switch (action) {
      case "MG_IN":
        if (tg.MGBreakIn) return res.status(400).json({ message: "MG break already started" });
        tg.MGBreakIn = now;
        break;

      case "MG_OUT":
        if (!tg.MGBreakIn || tg.MGBreakOut)
          return res.status(400).json({ message: "MG break not active" });
        tg.MGBreakOut = now;
        break;

      case "LUNCH_IN":
        if (tg.LunchbreakIn) return res.status(400).json({ message: "Lunch break already started" });
        tg.LunchbreakIn = now;
        break;

      case "LUNCH_OUT":
        if (!tg.LunchbreakIn || tg.LunchbreakOut)
          return res.status(400).json({ message: "Lunch break not active" });
        tg.LunchbreakOut = now;
        break;

      case "EVE_IN":
        if (tg.EveBreakIn) return res.status(400).json({ message: "Evening break already started" });
        tg.EveBreakIn = now;
        break;

      case "EVE_OUT":
        if (!tg.EveBreakIn || tg.EveBreakOut)
          return res.status(400).json({ message: "Evening break not active" });
        tg.EveBreakOut = now;
        break;

      case "TIME_OUT":
        if (tg.timeOut) return res.status(400).json({ message: "Already timed out" });
        tg.timeOut = now;
        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    await tg.save();

    const workingMs = calculateWorkingMsLive(tg);

    res.json({
      taskGroupId: tg._id,
      date: tg.date,
      timeIn: tg.timeIn,
      timeOut: tg.timeOut,
      breaks: {
        mg: [tg.MGBreakIn, tg.MGBreakOut],
        lunch: [tg.LunchbreakIn, tg.LunchbreakOut],
        evening: [tg.EveBreakIn, tg.EveBreakOut],
      },
      workingMs,
      workingTime: formatMs(workingMs),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
