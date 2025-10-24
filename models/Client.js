// backend/models/Client.js
import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  clientName: String,
  clientRequirement: String,
  clientStartDate: String,
  clientEndDate: String,
  clientContact: String,
  clientEmail: String,
  clientLocation: String,
  clientProjectValue: String,
});

export default mongoose.model("Client", ClientSchema);
