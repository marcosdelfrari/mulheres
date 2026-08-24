import { z } from "zod";
import { normalizeBrazilPhone } from "@/lib/phone";

export const listingWriteSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do anúncio."),
  description: z
    .string()
    .trim()
    .min(40, "Descrição com pelo menos 40 caracteres."),
  pricePerHour: z.coerce.number().int().min(50, "Valor mínimo R$ 50."),
  priceDisplayUnit: z
    .enum(["hour", "half_hour"])
    .default("hour"),
  age: z.coerce.number().int().min(18, "Idade mínima 18.").max(80),
  gender: z.string().trim().min(1).default("Mulher"),
  region: z.string().trim().min(2, "Informe o estado."),
  city: z.string().trim().min(2, "Informe a cidade."),
  neighborhood: z.string().trim().min(2, "Informe o bairro."),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  services: z.array(z.string()).default([]),
  servicesFor: z.array(z.string()).default([]),
  serviceLocations: z.array(z.string()).default([]),
  typeTags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "paused"]).default("published"),
  photos: z
    .array(z.string().trim().min(1))
    .min(1, "O anúncio precisa de pelo menos 1 foto.")
    .max(5, "No máximo 5 fotos por anúncio."),
  photoUrl: z.string().trim().optional().nullable(),
});

export type ListingWriteInput = z.infer<typeof listingWriteSchema>;

/** Telefone do anúncio: prioriza o WhatsApp informado no formulário. */
export function resolveListingContact(
  parsed: Pick<ListingWriteInput, "phone" | "whatsapp">,
  userPhone: string | null | undefined,
) {
  const raw =
    parsed.whatsapp?.trim() ||
    parsed.phone?.trim() ||
    userPhone?.trim() ||
    "";
  const contact = normalizeBrazilPhone(raw) || null;
  return { phone: contact, whatsapp: contact };
}
