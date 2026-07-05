import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database";

export async function fetchNotifications(): Promise<NotificationRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function markAllRead(): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("notifications").update({ read: true }).eq("read", false);
  if (error) throw error;
}

export async function markOneRead(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}
