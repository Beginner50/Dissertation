import { useQuery } from "@tanstack/react-query";
import { origin, user } from "../temp";
import ky from "ky";
import type { User } from "../types";

export function useUnsupervisedStudentsQuery() {
  return useQuery({
    queryKey: ["unsupervised-students"],
    queryFn: async () => {
      const response = await ky.get(`${origin}/api/users`);
      if (!response.ok) throw new Error("Could not fetch users");

      const unsupervisedUsersData = (await response.json()) as User[];
      return unsupervisedUsersData;
    },
  });
}
