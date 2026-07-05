import { z } from "zod";
import { PROSPECT_STAGES } from "@/types/domain";
import { optionalInt, numOrNull } from "@/lib/zod";

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
  budget_amount: optionalInt,
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
    budget_amount: numOrNull(values.budget_amount),
    search_label: values.search_label || null,
    stage: values.stage,
  };
}
