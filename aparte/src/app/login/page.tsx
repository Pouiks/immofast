"use client";

import { useActionState } from "react";
import { signIn, type AuthResult } from "@/features/auth/actions";
import { Field, Input, Button } from "@/components/ui";

/**
 * Écran de connexion plein écran (fond sombre + halos accent/cyan).
 * Le formulaire cible `signIn` (actif dès que Supabase est branché).
 * « Continuer la démo » permet d'explorer l'app avant l'auth cloud.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(signIn, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0b12] text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(37,99,235,.28),transparent_58%),radial-gradient(circle_at_82%_82%,rgba(56,189,248,.20),transparent_55%)]" />

      <div className="relative w-[408px] max-w-[92%] rounded-[22px] bg-surface px-[30px] py-[34px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)]">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-xl font-extrabold text-white">
            A
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight">Aparté</div>
            <div className="text-[11px] font-semibold tracking-wide text-faint">
              CRM IMMOBILIER · SaaS
            </div>
          </div>
        </div>

        <h1 className="mb-1 text-[21px] font-extrabold tracking-tight">Connexion à votre espace</h1>
        <p className="mb-[22px] text-[12.5px] font-semibold text-[#8a8a9a]">
          Accès réservé aux abonnés actifs.
        </p>

        <form action={formAction} className="flex flex-col gap-3.5">
          <Field label="Email">
            <Input name="email" type="email" defaultValue="camille@agence.fr" required />
          </Field>
          <Field label="Mot de passe">
            <Input name="password" type="password" defaultValue="demodemo" required />
          </Field>
          {state.error && <p className="text-xs font-bold text-danger">{state.error}</p>}
          <Button type="submit" disabled={pending} className="mt-1 w-full py-3">
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] font-semibold text-[#b4b2c0]">
          Démo : camille@agence.fr · demodemo — souscrivez sur le site pour un accès.
        </p>
      </div>
    </div>
  );
}
