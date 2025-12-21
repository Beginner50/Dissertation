import ky from "ky";
import { ProjectList } from "../../components/project.components/project-list.component";
import { ReminderList } from "../../components/reminder-list.components/reminder-list.component";
import type { Project } from "../../lib/types";
import { origin, user } from "../../lib/temp";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ProjectActions from "../../components/project.components/project-list-entry.component";

export default function DashboardProjectsRoute() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<
    "closed" | "create" | "edit" | "join" | "archive"
  >("closed");

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${user.userID}/projects`
      );
      if (!response.ok) throw new Error("Failed to fetch projects");

      const projectData = (await response.json()) as Project[];
      return projectData;
    },
  });

  const handleCreateProject = () => {
    console.log("Create Project button clicked");
  };

  const handleJoinProject = () => {
    console.log("Join Project button clicked");
  };

  const handleEditProject = () => {};

  const handleArchiveProject = () => {};

  return (
    <>
      <ProjectList
        sx={{
          flexGrow: 3,
          overflowY: "auto",
          flexDirection: "column",
        }}
      >
        <ProjectList.Header>
          <ProjectList.Actions
            onCreateProjectButtonClick={() => setModalState("create")}
            onJoinProjectButtonClick={() => setModalState("join")}
          />
        </ProjectList.Header>

        <ProjectList.Content
          projects={projects ?? []}
          onEditButtonClick={() => setModalState("edit")}
          onArchiveButtonClick={() => setModalState("archive")}
        />
      </ProjectList>

      <ReminderList
        sx={{
          flexGrow: 1,
        }}
      />
    </>
  );
}
