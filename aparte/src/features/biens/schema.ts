import { z } from "zod";
import { PROPERTY_STATUSES, CONTRACT_STEPS, DPE_CLASSES } from "@/types/domain";
import { optionalInt, optionalNumber, numOrNull } from "@/lib/zod";

/** Validation du formulaire bien (création & édition). Description obligatoire. */
export const propertyFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire"),
  city: z.string().trim().optional().default(""),
  property_type: z.string().trim().optional().default(""),
  price_amount: optionalInt,
  surface_m2: optionalNumber,
  rooms: optionalInt,
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  floor_label: z.string().trim().optional().default(""),
  dpe: z.enum(DPE_CLASSES).optional().or(z.literal("")),
  margin_pct: optionalNumber,
  status: z.enum(PROPERTY_STATUSES),
  description: z.string().trim().min(1, "La description est obligatoire"),
  offer_prospect_id: z.string().optional().default(""),
  contract_step: z.enum(CONTRACT_STEPS).optional().or(z.literal("")),
  published: z.boolean().optional().default(false),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

/** Normalise les valeurs du formulaire en payload d'insertion/mise à jour. */
export function toPropertyPayload(values: PropertyFormValues) {
  return {
    title: values.title,
    city: values.city || null,
    property_type: values.property_type || null,
    price_amount: numOrNull(values.price_amount),
    surface_m2: numOrNull(values.surface_m2),
    rooms: numOrNull(values.rooms),
    bedrooms: numOrNull(values.bedrooms),
    bathrooms: numOrNull(values.bathrooms),
    floor_label: values.floor_label || null,
    dpe: values.dpe || null,
    margin_pct: numOrNull(values.margin_pct),
    status: values.status,
    description: values.description,
    offer_prospect_id: values.offer_prospect_id || null,
    contract_step: values.contract_step || null,
    published: values.published ?? false,
  };
}
