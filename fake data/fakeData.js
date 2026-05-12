import fs from "fs";

// read files
const projects = JSON.parse(
  fs.readFileSync("./Rightup_business.projects.json", "utf-8")
);

const taskGroups = JSON.parse(
  fs.readFileSync("./Rightup_business.taskgroups.json", "utf-8")
);

// update taskgroups
const updatedTaskGroups = taskGroups.map((group) => {
  group.tasks = group.tasks.map((task) => {
    // match project by project name
    const matchedProject = projects.find(
      (p) =>
        p.projectName?.trim().toLowerCase() ===
        task.projname?.trim().toLowerCase()
    );

    // if matched replace projectId + project name
    if (matchedProject) {
      return {
        ...task,

        projectId: {
          $oid: matchedProject._id.$oid,
        },

        projname: matchedProject.projectName,
      };
    }

    return task;
  });

  return group;
});

// write output
fs.writeFileSync(
  "./updated-taskgroups.json",
  JSON.stringify(updatedTaskGroups, null, 2)
);

console.log("updated-taskgroups.json generated successfully");