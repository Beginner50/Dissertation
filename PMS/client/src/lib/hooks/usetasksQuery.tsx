import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { user, origin } from "../temp";
import type { Task } from "../types";

export function useTasksQuery(projectID: number | string | undefined) {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${user.userID}/projects/${projectID}/tasks`
      );
      if (!response.ok)
        console.error(`Could not get data for project ${projectID}/tasks`);

      const tasks = await response.json();
      console.log("Tasks: ", tasks);
      return tasks as Task[];
    },
  });
}
