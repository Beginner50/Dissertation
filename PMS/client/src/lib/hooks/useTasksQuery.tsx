import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { user, origin } from "../temp";
import type { Task } from "../types";

export function useTasksQuery({
  projectID,
}: {
  projectID: number | string | undefined;
}) {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${user.userID}/projects/${projectID}/tasks`
      );
      if (!response.ok)
        console.error(`Could not get data for project ${projectID}/tasks`);

      const tasks = await response.json();
      return tasks as Task[];
    },
  });
}

export function useSingleTaskQuery({
  projectID,
  taskID,
}: {
  projectID: number | string | undefined;
  taskID: number | string | undefined;
}) {
  return useQuery({
    queryKey: ["tasks", taskID],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`
      );
      if (!response.ok) console.error("Could not get task data");

      const task = await response.json();
      return task as Task;
    },
  });
}
