import { useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";

export function useProjectsMutation() {
  const queryClient = useQueryClient();
  const projectMutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
    }: {
      method?: string;
      url: string;
      data: any;
    }) => {
      const httpClient = ky.create({ method: method ?? "post" });
      const response = await httpClient(url, { json: data });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        refetchType: "all",
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ["unsupervised-projects"] });
    },
    onError: (error) => {
      console.error("Project Mutation error", error);
    },
  });
  return projectMutation;
}
