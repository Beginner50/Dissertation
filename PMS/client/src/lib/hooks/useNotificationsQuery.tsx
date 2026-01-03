import { useQuery } from "@tanstack/react-query";
import { origin } from "../temp";
import ky from "ky";
import type { Notification } from "../types";

export function useNotificationsQuery({
  userID,
}: {
  userID: number | string | undefined;
}) {
  return useQuery({
    queryKey: ["notifications", userID],
    queryFn: async () => {
      const response = await ky.get(
        `${origin}/api/users/${userID}/notifications`
      );
      if (!response.ok) throw new Error("Could not fetch notifications");

      const reminders = (await response.json()) as Notification[];
      return reminders;
    },
  });
}
