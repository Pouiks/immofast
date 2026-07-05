"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAccounts, createAccount, setAccountStatus } from "./api";

const accountsKey = ["admin", "accounts"] as const;

export function useAccounts() {
  return useQuery({ queryKey: accountsKey, queryFn: fetchAccounts });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useSetAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: Parameters<typeof setAccountStatus>[1] }) =>
      setAccountStatus(v.id, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

/** MRR estimé : somme des abonnements actifs (mensuel 49 €, annuel 529,20 €/12). */
export function estimateMRR(
  accounts: { plan: string; status: string }[],
): number {
  return Math.round(
    accounts
      .filter((a) => a.status === "active")
      .reduce((sum, a) => sum + (a.plan === "annuel" ? 529.2 / 12 : 49), 0),
  );
}
