-- Index unique pour l'upsert des factures Stripe (les NULL restent distincts,
-- donc compatible avec d'éventuelles factures locales sans id Stripe).
create unique index if not exists invoices_stripe_invoice_id_key
  on invoices (stripe_invoice_id);
