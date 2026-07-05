import { KpiCard } from "@/components/ui";
import { ComingSoon } from "@/components/shell/coming-soon";

/**
 * Console admin — KPIs (espaces, abonnements, MRR) + gestion des espaces clients.
 * Valeurs de démo ; branchées sur les agrégats `accounts` (via React Query)
 * dans la phase feature admin.
 */
export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Espaces clients" value="3" />
        <KpiCard label="Abonnements actifs" value="2" />
        <KpiCard label="MRR estimé" value="1 245 €" accent />
      </div>
      <ComingSoon
        title="Espaces clients"
        description="Liste des espaces, autorisation d'un nouveau client, suspension / activation — à construire."
      />
    </div>
  );
}
