import { z } from "zod";
import { PROSPECT_STAGES } from "@/types/domain";

/** Validation du formulaire prospect (création & édition). */
export const prospectFormSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom est obligatoire"),
  phone: z.string().trim().optional().default(""),
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .or(z.literal(""))
    .optional()
    .default(""),
  address: z.string().trim().optional().default(""),
  budget_amount: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.nan().transform(() => undefined)),
  search_label: z.string().trim().optional().default(""),
  stage: z.enum(PROSPECT_STAGES),
});

export type ProspectFormValues = z.infer<typeof prospectFormSchema>;

/** Normalise les valeurs du formulaire en payload d'insertion/mise à jour. */
export function toProspectPayload(values: ProspectFormValues) {
  return {
    full_name: values.full_name,
    phone: values.phone || null,
    email: values.email || null,
    address: values.address || null,
    budget_amount: typeof values.budget_amount === "number" ? values.budget_amount : null,
    search_label: values.search_label || null,
    stage: values.stage,
  };
}
