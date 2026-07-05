import { Card, KpiCard } from "@/components/ui";

/**
 * Tableau de bord — mise en page de référence exerçant les design tokens.
 * Les valeurs sont statiques (démo) : elles seront branchées sur des agrégats
 * Supabase (via React Query) dans la phase « feature dashboard ».
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-4 gap-[18px]">
        <KpiCard label="Mandats actifs" value="5" hint="▲ 2 ce mois" hintTone="success" />
        <KpiCard label="Nouveaux prospects" value="6" hint="▲ cette semaine" hintTone="success" />
        <KpiCard label="Visites planifiées" value="5" hint="cette semaine" />
        <KpiCard label="Pipeline prévisionnel" value="1,84 M€" hint="▲ 320 k€ vs. mois-1" accent />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px]">
        <Card className="p-5">
          <div className="mb-4 text-[15px] font-extrabold">Kanban des affaires</div>
          <div className="flex flex-col gap-2.5">
            {[
              ["Prospects", 18, "100%"],
              ["Qualifiés", 11, "78%"],
              ["Visites", 7, "55%"],
              ["Offres", 4, "32%"],
              ["Compromis", 2, "18%"],
            ].map(([label, count, w]) => (
              <div key={label as string} className="flex items-center gap-3">
                <div className="w-[78px] text-xs font-bold text-muted">{label}</div>
                <div
                  className="flex h-[26px] items-center rounded-[7px] bg-gradient-to-r from-accent to-accent-2 pl-3 text-xs font-bold text-white"
                  style={{ width: w as string }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3.5 text-[15px] font-extrabold">Visites à venir</div>
          <div className="text-[13px] font-semibold text-faint">
            Les visites s'afficheront ici une fois l'agenda branché.
          </div>
        </Card>
      </div>
    </div>
  );
}
