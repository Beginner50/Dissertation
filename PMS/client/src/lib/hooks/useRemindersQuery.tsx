import { useQuery } from "@tanstack/react-query";
import { origin, user } from "../temp";
import ky from "ky";
import type { Reminder } from "../types";

export function useRemindersQuery({
  userID,
}: {
  userID: number | string | undefined;
}) {
  return useQuery({
    queryKey: ["reminders", userID],
    queryFn: async () => {
      const response = await ky.get(`${origin}/api/users/${userID}/reminders`);
      if (!response.ok) throw new Error("Could not fetch reminders");

      const reminders = (await response.json()) as Reminder[];
      return reminders;
    },
  });
}
