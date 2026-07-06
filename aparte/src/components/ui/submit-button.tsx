"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

/**
 * Bouton de soumission qui reflète l'état d'envoi du <form> parent
 * (useFormStatus) : spinner + curseur « progress » + désactivation, pour un
 * retour visuel immédiat sur les actions serveur lentes (ex. session Stripe).
 * À utiliser à l'intérieur d'un <form action={serverAction}>.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-busy={pending}
      disabled={pending || props.disabled}
      className={cn(pending && "cursor-progress", className)}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {pendingLabel ?? "Chargement…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Variante « lien texte » (ex. « Modifier ») avec le même retour de chargement. */
export function SubmitTextButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-busy={pending}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold text-accent",
        pending && "cursor-progress opacity-70",
        className,
      )}
    >
      {pending && <Loader2 size={12} className="animate-spin" />}
      {pending ? (pendingLabel ?? "…") : children}
    </button>
  );
}
