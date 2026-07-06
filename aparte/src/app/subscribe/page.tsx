import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/current-user";
import { getAccessState } from "@/features/billing/access-server";
import { hasCrmAccess } from "@/features/billing/access";
import { startCheckout } from "@/features/billing/actions";
import { signOut } from "@/features/auth/actions";
import { ThemeProvider } from "@/components/theme-provider";
import { SubmitButton } from "@/components/ui";
import { initials } from "@/lib/utils";

/**
 * Paywall : affiché quand l'essai est terminé sans abonnement actif
 * (ou l'espace suspendu). Le CRM reste inaccessible tant que l'abonnement
 * n'est pas actif ; l'utilisateur choisit une formule (Stripe Checkout).
 */
export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  const access = await getAccessState(user);
  if (hasCrmAccess(access)) redirect("/dashboard");

  const suspended = access === "suspended";

  return (
    <ThemeProvider accent={user.account.accent}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0b12] text-ink">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(37,99,235,.28),transparent_58%),radial-gradient(circle_at_82%_82%,rgba(56,189,248,.20),transparent_55%)]" />

        <div className="relative w-[460px] max-w-[92%] rounded-[22px] bg-surface px-8 py-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)]">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-xl font-extrabold text-white">
              {initials(user.account.brandName, 1)}
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">{user.account.brandName}</div>
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
                Choisissez une formule pour continuer à utiliser votre espace. Paiement
                sécurisé par Stripe, résiliable à tout moment.
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
    </ThemeProvider>
  );
}
