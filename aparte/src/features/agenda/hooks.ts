"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  type VisitPayload,
} from "./api";

export const visitKeys = { all: ["visits"] as const };

export function useVisits() {
  return useQuery({ queryKey: visitKeys.all, queryFn: fetchVisits });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: visitKeys.all });
}

export function useCreateVisit() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createVisit, onSuccess: invalidate });
}

export function useUpdateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<VisitPayload> }) => updateVisit(v.id, v.patch),
    // Déplacement optimiste (glisser-déposer) pour un rendu instantané.
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: visitKeys.all });
      const prev = qc.getQueryData(visitKeys.all);
      qc.setQueryData(visitKeys.all, (old: { id: string }[] | undefined) =>
        old?.map((x) => (x.id === v.id ? { ...x, ...v.patch } : x)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(visitKeys.all, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: visitKeys.all }),
  });
}

export function useDeleteVisit() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteVisit, onSuccess: invalidate });
}
