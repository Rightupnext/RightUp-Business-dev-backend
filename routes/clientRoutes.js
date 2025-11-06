import express from "express";
import Client from "../models/Client.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Convert "02:30 PM" + "2025-10-29" → JS Date()
 */
function parseTimeToDate(dateStr, timeStr) {
  try {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const dateTime = new Date(dateStr);
    dateTime.setHours(hours);
    dateTime.setMinutes(parseInt(minutes));
    dateTime.setSeconds(0);
    return dateTime;
  } catch (err) {
    return null;
  }
}

/**
 * 🟩 GET all clients for the logged-in user
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    res.json(clients);
  } catch (err) {
    console.error("❌ Error fetching clients:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟩 CREATE a new client
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };

    // Convert reminder fields if available
    if (data.reminderDate && data.reminderTime && data.reminderMessage) {
      data.reminders = [
        {
          date: data.reminderDate,
          time: data.reminderTime,
          message: data.reminderMessage,
        },
      ];
      delete data.reminderDate;
      delete data.reminderTime;
      delete data.reminderMessage;
    }

    const client = await Client.create(data);
    console.log("✅ Client created:", client.clientName);

    res.status(201).json(client);
  } catch (err) {
    console.error("❌ Error saving client:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟩 UPDATE client
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert reminder fields if available
    if (data.reminderDate && data.reminderTime && data.reminderMessage) {
      data.reminders = [
        {
          date: data.reminderDate,
          time: data.reminderTime,
          message: data.reminderMessage,
        },
      ];
      delete data.reminderDate;
      delete data.reminderTime;
      delete data.reminderMessage;
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      data,
      { new: true }
    );

    if (!client) return res.status(404).json({ message: "Client not found" });

    console.log("✅ Client updated:", client.clientName);
    res.json({ message: "Client updated successfully", client });
  } catch (err) {
    console.error("❌ Error updating client:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🟩 DELETE client
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟩 GET all upcoming reminders
 */
router.get("/reminders", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    const reminders = [];
    const now = new Date();

    clients.forEach((client) => {
      (client.reminders || []).forEach((rem) => {
        const remDateTime = parseTimeToDate(rem.date, rem.time);
        if (remDateTime && remDateTime >= now) {
          reminders.push({
            _id: rem._id,
            clientId: client._id,
            clientName: client.clientName,
            clientContact: client.clientContact,
            date: rem.date,
            time: rem.time,
            message: rem.message,
          });
        }
      });
    });

    res.json(reminders);
  } catch (err) {
    console.error("❌ Error fetching reminders:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟩 DELETE a single reminder
 */
router.delete("/reminders/:id", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    let found = false;

    for (const client of clients) {
      const index = client.reminders.findIndex(
        (r) => r._id.toString() === req.params.id
      );
      if (index !== -1) {
        client.reminders.splice(index, 1);
        await client.save();
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: "Reminder not found" });
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting reminder:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
