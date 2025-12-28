import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { user, origin } from "../temp";
import type { Project } from "../types";

export function useUnsupervisedProjectsQuery({
  disabled,
}: {
  disabled?: boolean;
}) {
  return useQuery({
    queryKey: ["unsupervised-projects"],
    queryFn: async () => {
      const response = await ky.get(`${origin}/api/projects`);
      if (!response.ok)
        throw new Error("Failed to fetch unsupervised projects");

      const unsupervisedProjectData = (await response.json()) as Project[];
      console.log("UPD: ", unsupervisedProjectData);
      return unsupervisedProjectData;
    },
    enabled: disabled ? !disabled : true,
  });
}

export function useProjectsQuery() {
  return useQuery({
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
}

export function useSingleProjectQuery({
  projectID,
}: {
  projectID: string | number | undefined;
}) {
  return useQuery({
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
}
