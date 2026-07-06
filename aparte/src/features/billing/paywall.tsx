import { startCheckout } from "./actions";
import { signOut } from "@/features/auth/actions";
import { SubmitButton } from "@/components/ui";
import { initials } from "@/lib/utils";
import type { AccessState } from "./access";

/**
 * Paywall en **overlay flouté** par-dessus le CRM : l'utilisateur entrevoit son
 * espace (ce qu'il perd) tout en étant invité à s'abonner. Interactions du CRM
 * bloquées ; seules les actions d'abonnement / déconnexion sont possibles.
 */
export function Paywall({ access, brandName }: { access: AccessState; brandName: string }) {
  const suspended = access === "suspended";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[rgba(11,11,18,.45)] backdrop-blur-md" />

      <div className="relative w-[460px] max-w-full rounded-[22px] bg-surface px-8 py-9 shadow-overlay [animation:var(--animate-md-in)]">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-xl font-extrabold text-white">
            {initials(brandName, 1)}
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight">{brandName}</div>
            <div className="text-[11px] font-semibold tracking-wide text-faint">
              CRM IMMOBILIER · SaaS
            </div>
          </div>
        </div>

        {suspended ? (
          <>
            <h1 className="text-[21px] font-extrabold tracking-tight">Espace suspendu</h1>
            <p className="mt-1.5 text-[13px] font-medium text-muted">
              Votre espace a été suspendu. Contactez le support pour le réactiver.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[21px] font-extrabold tracking-tight">
              Votre essai gratuit est terminé
            </h1>
            <p className="mt-1.5 text-[13px] font-medium text-muted">
              Réactivez votre espace pour retrouver vos prospects, vos biens et votre pipeline.
              Paiement sécurisé par Stripe, résiliable à tout moment.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <form action={startCheckout}>
                <input type="hidden" name="plan" value="annuel" />
                <SubmitButton
                  pendingLabel="Redirection vers le paiement…"
                  className="w-full justify-between py-3.5"
                >
                  <span>
                    Formule annuelle <span className="opacity-80">· ‑10 %</span>
                  </span>
                  <span>529 € / an</span>
                </SubmitButton>
              </form>
              <form action={startCheckout}>
                <input type="hidden" name="plan" value="mensuel" />
                <SubmitButton
                  variant="outline"
                  pendingLabel="Redirection vers le paiement…"
                  className="w-full justify-between py-3.5"
                >
                  <span>Formule mensuelle</span>
                  <span>49 € / mois</span>
                </SubmitButton>
              </form>
            </div>
          </>
        )}

        <form action={signOut} className="mt-6 text-center">
          <button className="text-[12.5px] font-bold text-faint hover:text-muted">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
