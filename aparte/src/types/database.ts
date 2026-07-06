import type {
  Role,
  Plan,
  AccountStatus,
  ProspectStage,
  PropertyStatus,
  ContractStep,
  DpeClass,
  DocumentType,
  NotificationKind,
} from "./domain";

/**
 * Contrat typé de la base Supabase.
 * Rédigé à la main pour l'instant ; sera régénéré via
 *   `supabase gen types typescript --project-id <id> > src/types/database.ts`
 * une fois le projet cloud branché. Doit rester aligné avec les migrations SQL.
 *
 * NB : les Row sont des *alias de type* (et non des interfaces) — nécessaire
 * pour satisfaire la contrainte `Record<string, unknown>` du client Supabase.
 */

type Timestamps = { created_at: string };

/** Génère le triplet Row / Insert / Update d'une table à partir de sa Row. */
type Table<Row, Optional extends keyof Row = never> = {
  Row: Row;
  Insert: Omit<Row, "id" | "created_at" | Optional> &
    Partial<Pick<Row, ("id" | "created_at") & keyof Row>> &
    Partial<Pick<Row, Optional>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type AccountRow = Timestamps & {
  id: string;
  agency_name: string;
  brand_name: string;
  accent: [string, string];
  plan: Plan;
  status: AccountStatus;
  email: string | null;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
};

export type ProfileRow = Timestamps & {
  id: string; // = auth.users.id
  account_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  onboarding_completed: boolean;
  onboarding_step: number;
};

export type SubscriptionRow = Timestamps & {
  id: string;
  account_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: Plan | null;
  status: string; // statut Stripe
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
};

export type StripeEventRow = {
  id: string;
  type: string;
  processed_at: string;
};

export type ProspectRow = Timestamps & {
  id: string;
  account_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  budget_amount: number | null; // en euros
  search_label: string | null;
  stage: ProspectStage;
};

export type PropertyRow = Timestamps & {
  id: string;
  account_id: string;
  ref: string;
  title: string;
  city: string | null;
  price_amount: number | null; // en euros
  surface_m2: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_label: string | null;
  dpe: DpeClass | null;
  property_type: string | null;
  status: PropertyStatus;
  published: boolean;
  margin_pct: number | null;
  description: string;
  offer_prospect_id: string | null;
  contract_step: ContractStep | null;
};

export type PropertyPhotoRow = Timestamps & {
  id: string;
  property_id: string;
  storage_path: string;
  position: number;
};

export type VisitRow = Timestamps & {
  id: string;
  account_id: string;
  prospect_id: string | null;
  title: string;
  starts_at: string; // timestamptz
};

export type DocumentRow = Timestamps & {
  id: string;
  account_id: string;
  prospect_id: string;
  name: string;
  doc_type: DocumentType;
  storage_path: string | null;
};

export type NotificationEntity = "prospect" | "property" | "visit";

export type NotificationRow = Timestamps & {
  id: string;
  account_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  read: boolean;
  entity_type: NotificationEntity | null;
  entity_id: string | null;
};

export type InvoiceRow = Timestamps & {
  id: string;
  account_id: string;
  period: string; // ex. "2026-07"
  amount_cents: number;
  pdf_url: string | null;
  stripe_invoice_id: string | null;
  status: string | null;
  hosted_invoice_url: string | null;
};

export type PaymentMethodRow = Timestamps & {
  id: string;
  account_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  stripe_payment_method_id: string | null;
  is_default: boolean;
};

export type Database = {
  public: {
    Tables: {
      accounts: Table<
        AccountRow,
        "email" | "accent" | "plan" | "status" | "stripe_customer_id" | "trial_ends_at"
      >;
      profiles: Table<ProfileRow, "phone" | "onboarding_completed" | "onboarding_step">;
      subscriptions: Table<
        SubscriptionRow,
        | "stripe_subscription_id"
        | "stripe_price_id"
        | "plan"
        | "current_period_end"
        | "trial_end"
        | "cancel_at_period_end"
        | "updated_at"
      >;
      stripe_events: {
        Row: StripeEventRow;
        Insert: Omit<StripeEventRow, "processed_at"> & { processed_at?: string };
        Update: Partial<StripeEventRow>;
        Relationships: [];
      };
      // account_id est renseigné par trigger (set_account_id) → optionnel à l'insert.
      prospects: Table<
        ProspectRow,
        "account_id" | "phone" | "email" | "address" | "budget_amount" | "search_label" | "stage"
      >;
      properties: Table<
        PropertyRow,
        "account_id" | "status" | "published" | "offer_prospect_id" | "contract_step" | "description"
      >;
      property_photos: Table<PropertyPhotoRow, "position">;
      visits: Table<VisitRow, "account_id" | "prospect_id">;
      documents: Table<DocumentRow, "account_id" | "storage_path">;
      notifications: Table<
        NotificationRow,
        "account_id" | "body" | "read" | "entity_type" | "entity_id"
      >;
      invoices: Table<
        InvoiceRow,
        "pdf_url" | "stripe_invoice_id" | "status" | "hosted_invoice_url"
      >;
      payment_methods: Table<PaymentMethodRow, "stripe_payment_method_id" | "is_default">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
