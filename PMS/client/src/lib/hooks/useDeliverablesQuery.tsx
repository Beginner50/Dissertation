import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { origin, user } from "../temp";
import type { Deliverable } from "../types";

export function useSubmittedDeliverableQuery({
  projectID,
  taskID,
}: {
  projectID: number | string | undefined;
  taskID: number | string | undefined;
}) {
  return useQuery({
    queryKey: ["deliverable", "submitted"],
    queryFn: async () => {
      try {
        const response = await ky.get(
          `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable`
        );
        const submittedDeliverable = (await response.json()) as Deliverable;
        return submittedDeliverable;
      } catch (e) {
        return null;
      }
    },
    retry: 1,
  });
}

export function useStagedDeliverableQuery({
  projectID,
  taskID,
  disabled,
}: {
  projectID: number | string | undefined;
  taskID: number | string | undefined;
  disabled: boolean;
}) {
  return useQuery({
    queryKey: ["deliverable", "staged"],
    queryFn: async () => {
      try {
        const response = await ky.get(
          `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`
        );
        const stagedDeliverable = (await response.json()) as Deliverable;
        return stagedDeliverable;
      } catch (e) {
        return null;
      }
    },
    enabled: !disabled,
    retry: 1,
  });
}
