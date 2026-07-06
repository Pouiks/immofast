"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

/** Membres de la licence (titulaire + invités) — RLS limite au même espace. */
async function fetchMembers(): Promise<ProfileRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export function useMembers() {
  return useQuery({ queryKey: ["members"], queryFn: fetchMembers });
}
