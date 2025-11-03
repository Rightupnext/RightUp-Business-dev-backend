import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function sendPushifyTest() {
  try {
    const response = await axios.post(
      "https://pushify.com/api/personal-notifications",
      {
        website_id: process.env.PUSHIFY_WEBSITE_ID,
        title: "🔔 Test Notification",
        description: "Your Pushify setup is working!",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PUSHIFY_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Notification sent:", response.data);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

sendPushifyTest();
