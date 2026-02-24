import express from "express";
import Client from "../models/Client.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

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


router.get("/getclientDetails", verifyToken, async (req, res) => {
  if (req.user.role !== "business")
    return res.status(403).json({ error: "Access denied" });

  const clients = await Client.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(clients);
});



router.post("/", verifyToken, upload.array("files"), async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };

    // Create reminder object
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

    // Process files
    if (req.files && req.files.length > 0) {
      data.attachments = req.files.map((file) => ({
        name: file.originalname,
        url: `/uploads/clients/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
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
 * 🟩 UPDATE client (ANY business user can update ANY client)
 */
router.put("/:id", verifyToken, upload.array("files"), async (req, res) => {
  try {
    const data = { ...req.body };

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

    // Handle attachments persistence/update
    // existingAttachments should be passed as a JSON string if part of FormData
    let currentAttachments = [];
    if (data.existingAttachments) {
      try {
        currentAttachments = JSON.parse(data.existingAttachments);
        delete data.existingAttachments;
      } catch (e) {
        currentAttachments = [];
      }
    }

    // Add new files
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        name: file.originalname,
        url: `/uploads/clients/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
      currentAttachments = [...currentAttachments, ...newAttachments];
    }

    data.attachments = currentAttachments;

    const client = await Client.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    console.log("✅ Client updated:", client.clientName);
    res.json({ message: "Client updated successfully", client });
  } catch (err) {
    console.error("❌ Error updating client:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🟩 DELETE client (ANY business user can delete ANY client)
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) return res.status(404).json({ error: "Client not found" });

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting client:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🟩 GET all reminders (ALL business users see ALL reminders)
 */
router.get("/reminders", verifyToken, async (req, res) => {
  try {
    // Allow access but restrict results
    if (req.user.role !== "business") {
      return res.json([]);
    }

    const clients = await Client.find();
    const reminders = [];
    const now = new Date();

    clients.forEach((client) => {
      (client.reminders || []).forEach((rem) => {
        const remDateTime = parseTimeToDate(rem.date, rem.time);

        if (remDateTime) {
          const reminderDate = new Date(rem.date);
          const today = new Date();

          const isSameDay =
            reminderDate.getFullYear() === today.getFullYear() &&
            reminderDate.getMonth() === today.getMonth() &&
            reminderDate.getDate() === today.getDate();

          if (remDateTime >= now || isSameDay) {
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
 * 🟩 DELETE a single reminder (ANY business user can delete ANY reminder)
 */
router.delete("/reminders/:id", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find();
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
