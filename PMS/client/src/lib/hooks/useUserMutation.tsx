import { useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";

export function useUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("User Mutation error", error);
    },
  });
}
