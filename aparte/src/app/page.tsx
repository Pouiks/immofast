import { redirect } from "next/navigation";

/** Racine → renvoie vers le CRM (le middleware gère l'authentification). */
export default function RootPage() {
  redirect("/dashboard");
}
