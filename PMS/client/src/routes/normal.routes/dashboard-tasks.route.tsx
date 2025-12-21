import { useQuery } from "@tanstack/react-query";
import { ProjectDetails } from "../../components/project.components/project-details.component";
import { TaskList } from "../../components/task-list.components.tsx/task-list.component";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import ky from "ky";
import type { Project } from "../../lib/types";
import { useState } from "react";

export default function DashboardTasksRoute() {
  const [modalStatus, setModalStatus] = useState("closed");

  const { projectID } = useParams();
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["projects", projectID],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${user.userID}/projects/${projectID}`
      );
      if (!response.ok)
        console.error(`Could not get data for project ${projectID}`);

      const project = await response.json();
      console.log("Project", project);
      return project as Project;
    },
  });

  console.log(project);
  const handleGenerateProgressLogReport = () => {};

  return (
    <>
      <TaskList
        sx={{
          flexGrow: 3,
          overflowY: "auto",
          flexDirection: "column",
        }}
      >
        <TaskList.Header></TaskList.Header>
        <TaskList.Content />
      </TaskList>

      <ProjectDetails
        sx={{
          flexGrow: 1,
          maxWidth: "30vw",
          height: "fit-content",
        }}
      >
        <ProjectDetails.Header
          title={project?.title ?? ""}
          description={project?.description ?? ""}
        >
          <ProjectDetails.MemberInformation
            student={project?.student}
            supervisor={project?.supervisor}
          />
        </ProjectDetails.Header>

        <ProjectDetails.Actions
          isStudentAssigned={!!project?.student}
          handleGenerateProgressLogReport={handleGenerateProgressLogReport}
          onAddStudent={() => setModalStatus("add-student")}
        />
      </ProjectDetails>
    </>
  );
}
