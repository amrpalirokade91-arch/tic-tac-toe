import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameResult } from "../backend.d";
import { useActor } from "./useActor";

export function useGetScores() {
  const { actor, isFetching } = useActor();
  return useQuery<GameResult>({
    queryKey: ["scores"],
    queryFn: async () => {
      if (!actor) return { xWins: 0n, oWins: 0n, draws: 0n };
      return actor.getScores();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordGameResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (winner: string) => {
      if (!actor) return;
      await actor.recordGameResult(winner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
  });
}

export function useResetScores() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.resetScores();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
  });
}
