import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  date: String, // YYYY-MM-DD
  time: String, // HH:MM
  message: String,
  notified: { type: Boolean, default: false } // track if notification was shown
});

const ClientSchema = new mongoose.Schema({
  clientName: String,
  clientRequirement: String,
  clientStartDate: String,
  clientEndDate: String,
  clientContact: String,
  clientEmail: String,
  clientLocation: String,
  clientProjectValue: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reminders: [ReminderSchema]
});

export default mongoose.model("Client", ClientSchema);
