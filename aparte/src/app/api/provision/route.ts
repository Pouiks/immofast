import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { provisionAccount } from "@/features/provisioning/provision";
import type { Plan } from "@/types/domain";

/**
 * API de provisioning appelée par le site vitrine (achat d'une licence).
 * Protégée par un secret partagé (header `x-provision-secret`).
 * Crée l'espace + l'utilisateur + l'essai 24 h et renvoie le lien d'invitation.
 */
export async function POST(req: NextRequest) {
  if (!env.provisionSecret) {
    return NextResponse.json({ error: "provisioning non configuré" }, { status: 503 });
  }
  if (req.headers.get("x-provision-secret") !== env.provisionSecret) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  let body: { email?: string; agencyName?: string; plan?: Plan };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "corps JSON invalide" }, { status: 400 });
  }
  if (!body.email) {
    return NextResponse.json({ error: "email requis" }, { status: 400 });
  }

  try {
    const result = await provisionAccount({
      email: body.email,
      agencyName: body.agencyName,
      plan: body.plan,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[provision] échec", err);
    return NextResponse.json({ error: "provisioning échoué" }, { status: 500 });
  }
}
