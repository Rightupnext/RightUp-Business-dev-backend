import Project from "../models/Project.js";

export const getProjectsByCategory = async (req, res) => {
  try {
    const { type } = req.params;
    const projects = await Project.find({ projectType: type });

    if (!projects.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
