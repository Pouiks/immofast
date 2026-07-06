"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CurrentUser } from "@/features/auth/current-user";
import type { Plan, AccountStatus, Role } from "@/types/domain";

interface AccountState {
  profile: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: Role;
    onboardingCompleted: boolean;
  };
  account: {
    id: string;
    agencyName: string;
    brandName: string;
    accent: [string, string];
    plan: Plan;
    status: AccountStatus;
    trialEndsAt: string | null;
  };
}

interface AccountContextValue extends AccountState {
  /** Mise à jour locale immédiate (ex. marque blanche « live »). */
  patchAccount: (patch: Partial<AccountState["account"]>) => void;
  patchProfile: (patch: Partial<AccountState["profile"]>) => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * Source de vérité *client* de l'espace + profil courant, initialisée depuis
 * le serveur. Permet des mises à jour instantanées (marque blanche, plan)
 * répercutées dans toute l'app sans rechargement.
 */
export function AccountProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser;
  children: ReactNode;
}) {
  const [state, setState] = useState<AccountState>({
    profile: {
      id: initialUser.id,
      fullName: initialUser.fullName,
      email: initialUser.email,
      phone: initialUser.phone,
      role: initialUser.role,
      onboardingCompleted: initialUser.onboardingCompleted,
    },
    account: initialUser.account,
  });

  const value: AccountContextValue = {
    ...state,
    patchAccount: (patch) => setState((s) => ({ ...s, account: { ...s.account, ...patch } })),
    patchProfile: (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount doit être utilisé dans <AccountProvider>");
  return ctx;
}
