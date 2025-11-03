import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import { sendPushNotification } from "../config/pushifyService.js";

// Your website ID from Pushify dashboard
const WEBSITE_ID = "102";

cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Checking reminders...");
  const now = new Date();

  const reminders = await Reminder.find({
    reminderTime: { $lte: now },
    notified: false,
  }).populate("user");

  for (const reminder of reminders) {
    if (reminder.pushifySubscriberId || reminder.user.pushifySubscriberId) {
      const subscriberId = reminder.pushifySubscriberId || reminder.user.pushifySubscriberId;

      await sendPushNotification({
        title: `Reminder for ${reminder.user.name}`,
        description: reminder.message,
        subscriberId,
        websiteId: WEBSITE_ID,
      });

      reminder.notified = true;
      await reminder.save();
      console.log(`🔔 Reminder sent to ${reminder.user.name}`);
    } else {
      console.log(`⚠️ No subscriber ID for user ${reminder.user.name}`);
    }
  }
});
