import mongoose from "mongoose";
import dotenv from "dotenv";
import TaskGroup from "./models/TaskGroup.js";
import cloudinary from "./config/cloudinary.js";

dotenv.config();

const testCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for testing");

        const now = new Date();
        // Simulate an image that expired 1 minute ago
        const expiredDate = new Date(now.getTime() - 60000);

        // Create a dummy group with an expired image
        // Note: You might need to adjust the userId to a valid one from your DB
        const dummyGroup = new TaskGroup({
            userId: new mongoose.Types.ObjectId(), // Just for test
            date: "2026-02-17",
            tasks: [{
                projname: "Test Project",
                name: "Test Task",
                images: [{
                    url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                    public_id: "test_sample_id",
                    deleteAt: expiredDate
                }]
            }]
        });

        await dummyGroup.save();
        console.log("Created dummy group with expired image");

        // Manually run the cleanup logic (extracted from imageCleanup.js)
        console.log("Running cleanup logic...");
        const groups = await TaskGroup.find({
            "tasks.images.deleteAt": { $lte: now }
        });

        for (const group of groups) {
            let modified = false;
            for (const task of group.tasks) {
                const imagesToDelete = task.images.filter(img => img.deleteAt && img.deleteAt <= now);
                if (imagesToDelete.length > 0) {
                    for (const img of imagesToDelete) {
                        console.log(`Simulating deletion of ${img.public_id} from Cloudinary`);
                        // We won't actually call destroy unless we have a real public_id
                        // await cloudinary.uploader.destroy(img.public_id);
                    }
                    task.images = task.images.filter(img => !img.deleteAt || img.deleteAt > now);
                    modified = true;
                }
            }
            if (modified) {
                await group.save();
                console.log(`Updated TaskGroup ${group._id} after cleanup`);
            }
        }

        // Verify deletion
        const updatedGroup = await TaskGroup.findById(dummyGroup._id);
        if (updatedGroup.tasks[0].images.length === 0) {
            console.log("✅ Verification successful: Expired image removed from DB.");
        } else {
            console.error("❌ Verification failed: Expired image still exists in DB.");
        }

        // Cleanup the dummy group
        await TaskGroup.findByIdAndDelete(dummyGroup._id);
        console.log("Deleted dummy group");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test error:", err);
        process.exit(1);
    }
};

testCleanup();
