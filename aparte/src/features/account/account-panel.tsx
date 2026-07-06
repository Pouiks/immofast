"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useUIStore } from "@/stores/ui-store";
import { useAccount } from "./account-context";
import { useInvoices, usePaymentMethod, useUpdateProfile, useUpdateAccount } from "./hooks";
import { useSubscription } from "@/features/billing/hooks";
import { startCheckout, openBillingPortal } from "@/features/billing/actions";
import { signOut } from "@/features/auth/actions";
import { Overlay, Avatar, Button, Field, Input, EmptyState } from "@/components/ui";
import { cn, initials } from "@/lib/utils";
import { ROLE_LABELS } from "@/types/domain";

const SUB_STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: "Actif", tone: "success" },
  trialing: { label: "Essai en cours", tone: "success" },
  past_due: { label: "Paiement en retard", tone: "warning" },
  unpaid: { label: "Impayé", tone: "danger" },
  canceled: { label: "Résilié", tone: "danger" },
  incomplete: { label: "Incomplet", tone: "warning" },
};

type Tab = "profil" | "abonnement" | "facturation" | "marque";

const TAB_TITLES: Record<Tab, string> = {
  profil: "Profil",
  abonnement: "Abonnement",
  facturation: "Facturation",
  marque: "Marque blanche",
};

/**
 * Panneau Compte (façon réglages Claude). Onglets selon le rôle :
 * l'invité ne voit que « Profil » (facturation gérée par le titulaire).
 */
export function AccountPanel() {
  const { accountOpen, closeAccount } = useUIStore();
  const { profile } = useAccount();
  const [tab, setTab] = useState<Tab>("profil");

  if (!accountOpen) return null;
  const canBilling = profile.role === "client";
  const tabs: Tab[] = canBilling ? ["profil", "abonnement", "facturation", "marque"] : ["profil"];

  return (
    <Overlay onClose={closeAccount} z={70}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div className="pointer-events-auto relative flex h-[604px] max-h-[90vh] w-[900px] max-w-full overflow-hidden rounded-[20px] bg-surface shadow-overlay [animation:var(--animate-md-in)]">
          {/* Nav latérale */}
          <div className="flex w-[236px] flex-none flex-col gap-1 border-r border-line bg-soft px-3.5 py-5">
            <div className="flex items-center gap-2.5 px-2 pb-4 pt-1.5">
              <Avatar name={profile.fullName} size={44} radius={12} colors={["#ff8a5b", "#ff5b8a"]} />
              <div className="min-w-0">
                <div className="text-sm font-extrabold">{profile.fullName}</div>
                <div className="text-[11px] font-semibold text-faint">{ROLE_LABELS[profile.role]}</div>
              </div>
            </div>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-[10px] px-3 py-2.5 text-left text-[13px] font-bold transition",
                  tab === t ? "bg-accent text-white" : "text-muted hover:bg-app",
                )}
              >
                {TAB_TITLES[t]}
              </button>
            ))}
            {!canBilling && (
              <p className="px-3 py-2.5 text-[11px] font-semibold leading-relaxed text-ghost">
                La facturation et les moyens de paiement sont gérés par le titulaire du compte.
              </p>
            )}
            <form action={signOut} className="mt-auto">
              <button className="w-full rounded-[10px] px-3 py-2.5 text-left text-[12.5px] font-bold text-danger">
                Se déconnecter
              </button>
            </form>
          </div>

          {/* Contenu */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="text-[17px] font-extrabold">{TAB_TITLES[tab]}</div>
              <button
                onClick={closeAccount}
                className="flex size-8 items-center justify-center rounded-[9px] bg-app text-muted"
                aria-label="Fermer"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {tab === "profil" && <ProfilTab />}
              {tab === "abonnement" && <AbonnementTab />}
              {tab === "facturation" && <FacturationTab />}
              {tab === "marque" && <MarqueTab />}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function ProfilTab() {
  const { profile, account, patchProfile } = useAccount();
  const update = useUpdateProfile();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");

  const onSave = () => {
    patchProfile({ fullName, phone });
    update.mutate({ id: profile.id, patch: { full_name: fullName, phone: phone || null } });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom complet">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Rôle">
          <Input value={ROLE_LABELS[profile.role]} readOnly />
        </Field>
        <Field label="Email">
          <Input value={profile.email} readOnly />
        </Field>
        <Field label="Téléphone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Agence" className="col-span-2">
          <Input value={account.agencyName} readOnly />
        </Field>
      </div>
      <Button className="mt-5" onClick={onSave} disabled={update.isPending}>
        {update.isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </div>
  );
}

function AbonnementTab() {
  const { data: sub, isLoading } = useSubscription();
  if (isLoading) return <EmptyState>Chargement…</EmptyState>;

  // Aucun abonnement → proposer de souscrire (Stripe Checkout).
  if (!sub) {
    return (
      <div>
        <p className="mb-4 text-[13px] font-semibold text-muted">
          Activez votre espace en choisissant une formule. Le paiement est sécurisé par Stripe.
        </p>
        <div className="flex flex-col gap-2.5">
          <form action={startCheckout}>
            <input type="hidden" name="plan" value="mensuel" />
            <Button type="submit" className="w-full justify-between">
              Formule mensuelle <span>49 € / mois</span>
            </Button>
          </form>
          <form action={startCheckout}>
            <input type="hidden" name="plan" value="annuel" />
            <Button type="submit" variant="outline" className="w-full justify-between">
              Formule annuelle (‑10 %) <span>529 € / an</span>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const isAnnual = sub.plan === "annuel";
  const status = SUB_STATUS[sub.status] ?? { label: sub.status, tone: "warning" as const };

  return (
    <div>
      <div className="mb-[18px] rounded-card bg-gradient-to-br from-accent to-accent-2 p-[22px] text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold opacity-85">Formule actuelle</div>
            <div className="mt-0.5 text-2xl font-extrabold tracking-tight">
              Pro · {isAnnual ? "Annuel" : "Mensuel"}
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-extrabold">
            {status.label}
          </span>
        </div>
        {sub.current_period_end && (
          <div className="mt-3.5 text-[13px] font-semibold opacity-90">
            {sub.cancel_at_period_end ? "Se termine le " : "Renouvellement le "}
            {format(new Date(sub.current_period_end), "d MMMM yyyy", { locale: fr })}
          </div>
        )}
      </div>
      <form action={openBillingPortal}>
        <Button type="submit">Gérer l'abonnement</Button>
      </form>
      <p className="mt-2.5 text-[11.5px] font-semibold text-ghost">
        Changer de formule, mettre à jour la carte ou résilier via l'espace de facturation sécurisé.
      </p>
    </div>
  );
}

function FacturationTab() {
  const { data: pm } = usePaymentMethod();
  const { data: invoices = [] } = useInvoices();

  return (
    <div>
      <div className="mb-[18px] flex items-center gap-3 rounded-xl bg-app px-4 py-3.5">
        <div className="flex h-[30px] w-11 items-center justify-center rounded-md bg-[#1a1a24] text-[11px] font-extrabold text-white">
          {(pm?.brand ?? "carte").slice(0, 4).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold">
            {pm ? `${cap(pm.brand)} •••• ${pm.last4}` : "Aucun moyen de paiement"}
          </div>
          {pm ? (
            <div className="text-[11.5px] font-semibold text-[#8a8a9a]">
              Expire {String(pm.exp_month).padStart(2, "0")}/{pm.exp_year}
            </div>
          ) : (
            <div className="text-[11.5px] font-semibold text-[#8a8a9a]">
              Ajoutez une carte via l'espace sécurisé
            </div>
          )}
        </div>
        <form action={openBillingPortal}>
          <button type="submit" className="text-xs font-bold text-accent">
            {pm ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ghost">Factures</div>
      {invoices.length === 0 ? (
        <p className="py-2 text-[12.5px] font-semibold italic text-faint">
          Aucune facture pour le moment.
        </p>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between border-b border-line py-3">
            <div className="text-[13px] font-semibold">{formatPeriod(inv.period)}</div>
            <div className="flex items-center gap-3.5">
              <span className="text-[13px] font-bold">{(inv.amount_cents / 100).toFixed(2)} €</span>
              {(inv.hosted_invoice_url || inv.pdf_url) && (
                <a
                  href={inv.hosted_invoice_url ?? inv.pdf_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-accent"
                >
                  PDF
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MarqueTab() {
  const { account, patchAccount } = useAccount();
  const update = useUpdateAccount();

  return (
    <div>
      <p className="mb-4 text-[12.5px] font-semibold text-[#8a8a9a]">
        Personnalisez l'outil aux couleurs de votre agence. Ces réglages s'appliquent à votre espace.
      </p>
      <Field label="Nom de la marque" className="max-w-[320px]">
        <Input
          value={account.brandName}
          onChange={(e) => patchAccount({ brandName: e.target.value })}
        />
      </Field>
      <div className="mt-4 flex max-w-[320px] items-center gap-3 rounded-xl bg-app px-4 py-3.5">
        <div className="flex size-10 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-accent-2 text-lg font-extrabold text-white">
          {initials(account.brandName || "A", 1)}
        </div>
        <div>
          <div className="text-sm font-extrabold">{account.brandName || "—"}</div>
          <div className="text-[11px] font-semibold text-faint">Aperçu du logo</div>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={() => update.mutate({ id: account.id, patch: { brand_name: account.brandName } })}
        disabled={update.isPending}
      >
        {update.isPending ? "Enregistrement…" : "Enregistrer la marque"}
      </Button>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "2026-07" → "Juillet 2026". */
function formatPeriod(period: string): string {
  const [y, m] = period.split("-");
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  return `${months[Number(m) - 1] ?? period} ${y}`;
}
