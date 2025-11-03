// config/pushifyService.js
import axios from "axios";

const PUSHIFY_API_KEY = process.env.PUSHIFY_API_KEY; // add this in .env
const BASE_URL = "https://pushify.com/api";

export async function sendPushNotification({ title, description, subscriberId, websiteId }) {
  try {
    const response = await axios.post(
      `${BASE_URL}/personal-notifications`,
      {
        name: "Reminder Notification",
        website_id: websiteId,
        subscriber_id: subscriberId,
        title,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${PUSHIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Push sent:", response.data);
  } catch (error) {
    console.error("❌ Push send error:", error.response?.data || error.message);
  }
}
