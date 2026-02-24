import cron from "node-cron";
import TaskGroup from "../models/TaskGroup.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Cleanup job that runs every day at 00:00 (midnight)
 * It finds images where deleteAt <= now and deletes them from Cloudinary and DB.
 */
const startImageCleanupJob = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running scheduled image cleanup job...");
        try {
            const now = new Date();

            // Find task groups that have tasks with images needing deletion
            const groups = await TaskGroup.find({
                "tasks.images.deleteAt": { $lte: now }
            });

            for (const group of groups) {
                let modified = false;

                for (const task of group.tasks) {
                    const imagesToDelete = task.images.filter(img => img.deleteAt && img.deleteAt <= now);

                    if (imagesToDelete.length > 0) {
                        for (const img of imagesToDelete) {
                            if (img.public_id) {
                                try {
                                    await cloudinary.uploader.destroy(img.public_id);
                                    console.log(`Deleted image ${img.public_id} from Cloudinary`);
                                } catch (err) {
                                    console.error(`Failed to delete image ${img.public_id} from Cloudinary:`, err);
                                }
                            }
                        }

                        // Remove these images from the task's images array
                        task.images = task.images.filter(img => !img.deleteAt || img.deleteAt > now);
                        modified = true;
                    }
                }

                if (modified) {
                    await group.save();
                    console.log(`Updated TaskGroup ${group._id} after cleanup`);
                }
            }

            console.log("Image cleanup job completed.");
        } catch (err) {
            console.error("Error in image cleanup job:", err);
        }
    });
};

export default startImageCleanupJob;
