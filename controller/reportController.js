import TaskGroup from "../models/TaskGroup.js";

/* ================= HELPERS ================= */

// get all days till today of selected month
const getDaysInMonth = (year, month) => {
  const days = [];
  const totalDays = new Date(year, month, 0).getDate();
  const today = new Date();

  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month - 1, i);
    if (d > today) break;

    const formatted = `${year}-${String(month).padStart(2, "0")}-${String(
      i
    ).padStart(2, "0")}`;

    days.push(formatted);
  }
  return days;
};

// Sunday leave
const isSunday = (dateString) => new Date(dateString).getDay() === 0;

// 1st & 3rd Saturday leave
const isFirstOrThirdSaturday = (dateString) => {
  const d = new Date(dateString);
  if (d.getDay() !== 6) return false;
  const weekNumber = Math.ceil(d.getDate() / 7);
  return weekNumber === 1 || weekNumber === 3;
};

/* ================= CONTROLLER ================= */

export const getMonthlyReport = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const days = getDaysInMonth(yearNum, monthNum);

    // fetch attendance records of selected month
    const records = await TaskGroup.find({
      userId,
      date: { $regex: `^${year}-${String(month).padStart(2, "0")}` },
    });

    // 🔥 BUILD MONTHLY REPORT DAY-BY-DAY
    const report = days.map((day) => {
      const record = records.find((r) => r.date === day);

      // 🟢 PRESENT
      if (record && record.timeIn) {
        return {
          date: day,
          status: "Present",
          color: "green",
          timeIn: record.timeIn,
          timeOut: record.timeOut || "",
        };
      }

      // 🔵 WEEKEND LEAVE
      if (isSunday(day) || isFirstOrThirdSaturday(day)) {
        return {
          date: day,
          status: "Weekend Leave",
          color: "lightblue",
        };
      }

      // 🔴 ABSENT LEAVE
      return {
        date: day,
        status: "Absent Leave",
        color: "red",
      };
    });

    res.json(report);
  } catch (err) {
    console.error("Monthly report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
