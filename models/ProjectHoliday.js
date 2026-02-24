import mongoose from "mongoose";

const projectHolidaySchema = new mongoose.Schema(
  {
    imageUrl: String,
    publicId: String,
  },
  { timestamps: true }
);

export default mongoose.model("ProjectHoliday", projectHolidaySchema);
