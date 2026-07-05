"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

/** Connexion email/mot de passe. La redirection est gérée par le middleware. */
export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!hasSupabaseEnv) {
    return { error: "Supabase non configuré — utilisez « Continuer la démo » pour l'instant." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Identifiants invalides." };

  redirect("/dashboard");
}

/** Déconnexion — appelée depuis le panneau Compte / la console admin. */
export async function signOut() {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
