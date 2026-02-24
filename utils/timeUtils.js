// Current time → "11:06 pm"
export const nowTime12H = () => {
  const d = new Date();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

// Convert "11:06 pm" → Date object (TODAY)
export const parseTimeToday = (timeStr) => {
  if (!timeStr) return null;

  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "pm" && hours !== 12) hours += 12;
  if (modifier === "am" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Difference in ms between two "hh:mm am/pm" strings
export const diffMs = (start, end) => {
  if (!start || !end) return 0;
  return parseTimeToday(end) - parseTimeToday(start);
};

// Calculate working ms (breaks excluded)
export const calculateWorkingMs = (tg) => {
  if (!tg.timeIn || !tg.timeOut) return 0;

  let totalMs = diffMs(tg.timeIn, tg.timeOut);
  let breakMs = 0;

  breakMs += diffMs(tg.MGBreakIn, tg.MGBreakOut);
  breakMs += diffMs(tg.LunchbreakIn, tg.LunchbreakOut);
  breakMs += diffMs(tg.EveBreakIn, tg.EveBreakOut);

  return totalMs - breakMs;
};

// Format ms → "8h 25m"
export const formatMs = (ms) => {
  if (ms <= 0) return "0h 0m";

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);

  return `${h}h ${m}m`;
};
