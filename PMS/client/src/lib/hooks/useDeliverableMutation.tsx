import { useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";

export function useDeliverableMutation() {
  const queryClient = useQueryClient();
  const deliverableMutation = useMutation({
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
        queryKey: ["deliverable"],
      });
    },
    onError: (error) => {
      console.error("Project Mutation error", error);
    },
  });
  return deliverableMutation;
}
