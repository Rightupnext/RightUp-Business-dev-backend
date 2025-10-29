import express from "express";
import Client from "../models/Client.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get all clients
router.get("/", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create client
router.post("/", verifyToken, async (req, res) => {
  try {
    const clientData = { ...req.body, userId: req.user.id };
    // Handle reminder mapping
    if (clientData.reminderDate && clientData.reminderTime && clientData.reminderMessage) {
      clientData.reminders = [
        {
          date: clientData.reminderDate,
          time: clientData.reminderTime,
          message: clientData.reminderMessage
        }
      ];
      delete clientData.reminderDate;
      delete clientData.reminderTime;
      delete clientData.reminderMessage;
    }

    const client = await Client.create(clientData);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const clientData = { ...req.body };
    if (clientData.reminderDate && clientData.reminderTime && clientData.reminderMessage) {
      clientData.reminders = [
        {
          date: clientData.reminderDate,
          time: clientData.reminderTime,
          message: clientData.reminderMessage
        }
      ];
      delete clientData.reminderDate;
      delete clientData.reminderTime;
      delete clientData.reminderMessage;
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      clientData,
      { new: true }
    );
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all upcoming reminders
router.get("/reminders", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    const reminders = [];
    const now = new Date();

    clients.forEach(client => {
      client.reminders.forEach(rem => {
        const remDateTime = new Date(`${rem.date}T${rem.time}`);
        if (remDateTime >= now) {
          reminders.push({
            clientName: client.clientName,
            clientId: client._id,
            date: rem.date,
            time: rem.time,
            message: rem.message
          });
        }
      });
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
