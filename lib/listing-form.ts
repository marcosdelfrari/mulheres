import { z } from "zod";

export const listingWriteSchema = z.object({
  title: z.string().trim().min(2, "Informe o nome do anúncio."),
  description: z
    .string()
    .trim()
    .min(40, "Descrição com pelo menos 40 caracteres."),
  pricePerHour: z.coerce.number().int().min(50, "Valor mínimo R$ 50."),
  age: z.coerce.number().int().min(18, "Idade mínima 18.").max(80),
  gender: z.string().trim().min(1).default("Mulher"),
  region: z.string().trim().min(2).default("Minas Gerais"),
  city: z.string().trim().min(2).default("Belo Horizonte"),
  neighborhood: z.string().trim().min(2, "Informe o bairro."),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  services: z.array(z.string()).default([]),
  servicesFor: z.array(z.string()).default([]),
  serviceLocations: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "paused"]).default("published"),
  photos: z
    .array(z.string().trim().min(1))
    .min(1, "O anúncio precisa de pelo menos 1 foto.")
    .max(5, "No máximo 5 fotos por anúncio."),
  photoUrl: z.string().trim().optional().nullable(),
});

export type ListingWriteInput = z.infer<typeof listingWriteSchema>;
