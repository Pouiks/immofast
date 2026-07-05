"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProspects,
  fetchProspectDetail,
  createProspect,
  updateProspect,
  setProspectStage,
  deleteProspect,
  addDocument,
  deleteDocument,
} from "./api";
import type { ProspectStage } from "@/types/domain";

export const prospectKeys = {
  all: ["prospects"] as const,
  detail: (id: string) => ["prospect", id] as const,
};

export function useProspects() {
  return useQuery({ queryKey: prospectKeys.all, queryFn: fetchProspects });
}

export function useProspectDetail(id: string | null) {
  return useQuery({
    queryKey: id ? prospectKeys.detail(id) : ["prospect", "none"],
    queryFn: () => fetchProspectDetail(id!),
    enabled: !!id,
  });
}

/** Invalide la liste + la fiche concernée après une mutation. */
function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: prospectKeys.all });
    if (id) qc.invalidateQueries({ queryKey: prospectKeys.detail(id) });
  };
}

export function useCreateProspect() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: createProspect,
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProspect() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; payload: Parameters<typeof updateProspect>[1] }) =>
      updateProspect(v.id, v.payload),
    onSuccess: (_data, v) => invalidate(v.id),
  });
}

export function useSetProspectStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; stage: ProspectStage }) =>
      setProspectStage(v.id, v.stage),
    // Mise à jour optimiste : le pipeline réagit instantanément.
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: prospectKeys.all });
      const prev = qc.getQueryData(prospectKeys.all);
      qc.setQueryData(prospectKeys.all, (old: { id: string; stage: ProspectStage }[] | undefined) =>
        old?.map((p) => (p.id === v.id ? { ...p, stage: v.stage } : p)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(prospectKeys.all, ctx.prev);
    },
    onSettled: (_d, _e, v) => {
      qc.invalidateQueries({ queryKey: prospectKeys.all });
      qc.invalidateQueries({ queryKey: prospectKeys.detail(v.id) });
    },
  });
}

export function useDeleteProspect() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteProspect,
    onSuccess: () => invalidate(),
  });
}

export function useAddDocument() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: addDocument,
    onSuccess: (_d, v) => invalidate(v.prospect_id),
  });
}

export function useDeleteDocument() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; prospectId: string }) => deleteDocument(v.id),
    onSuccess: (_d, v) => invalidate(v.prospectId),
  });
}
