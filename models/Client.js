import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  date: String,
  time: String,
  message: String,
  notified: { type: Boolean, default: false },
});

const ClientSchema = new mongoose.Schema(
  {
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

    // 🔥 VERY IMPORTANT — the business user who created it
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    reminders: [ReminderSchema],
    attachments: [
      {
        name: String,
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true, // 🔥 REQUIRED FOR SORTING & SYNCING
  }
);

export default mongoose.model("Client", ClientSchema);
