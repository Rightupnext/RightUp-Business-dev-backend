import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  date: String, // YYYY-MM-DD
  time: String, // e.g. "02:30 PM"
  message: String,
  notified: { type: Boolean, default: false },
});

const ClientSchema = new mongoose.Schema({
  clientName: String,
   clientStartDate: String,
  clientRequirement: String,
  clientRefrence: String,
  clientEndDate: String,
  clientContact: String,
  clientEmail: String,
  clientDiscussionDate: String,
  clientLocation: String,
  clientFollowup: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reminders: [ReminderSchema],
});

export default mongoose.model("Client", ClientSchema);
