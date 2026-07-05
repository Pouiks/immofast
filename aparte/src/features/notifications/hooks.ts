"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAllRead, markOneRead } from "./api";

const key = ["notifications"] as const;

export function useNotifications() {
  return useQuery({ queryKey: key, queryFn: fetchNotifications });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markOneRead,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old: { id: string; read: boolean }[] | undefined) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old: { read: boolean }[] | undefined) =>
        old?.map((n) => ({ ...n, read: true })),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
