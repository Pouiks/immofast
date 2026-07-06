import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/features/auth/current-user";
import { reconcileAccountBilling } from "@/features/billing/reconcile";

/**
 * Point de retour après Stripe Checkout / Customer Portal.
 * Resynchronise la facturation depuis Stripe *avant* de rendre la main à l'app,
 * pour que l'utilisateur voie immédiatement l'état à jour (même sans webhook).
 */
export async function GET(req: NextRequest) {
  const toParam = req.nextUrl.searchParams.get("to");
  const to = toParam && toParam.startsWith("/") ? toParam : "/dashboard";

  const user = await getCurrentUser();
  if (user) {
    try {
      await reconcileAccountBilling(user.account.id);
    } catch (err) {
      console.error("[stripe return] réconciliation échouée", err);
    }
  }
  return NextResponse.redirect(new URL(to, env.appUrl));
}
