import { z } from "zod";
import {
  getCurrentUser,
  isOnlineFromLastLogin,
  jsonError,
  toListingSummary,
} from "@/lib/auth";
import {
  assertCanCreateListing,
  assertCanPublishListing,
  getListingLimits,
} from "@/lib/listing-limits";
import { prisma } from "@/lib/prisma";
import { uploadImagesToS3 } from "@/lib/s3";

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

const listingFieldsSchema = z.object({
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
});

function readListingFields(form: FormData) {
  return listingFieldsSchema.parse({
    title: form.get("title"),
    description: form.get("description"),
    pricePerHour: form.get("pricePerHour"),
    age: form.get("age") || 25,
    gender: form.get("gender") || "Mulher",
    region: form.get("region") || "Minas Gerais",
    city: form.get("city") || "Belo Horizonte",
    neighborhood: form.get("neighborhood") || "",
    phone: form.get("phone") || undefined,
    whatsapp: form.get("whatsapp") || undefined,
    services: parseJsonArray(form.get("services")),
    servicesFor: parseJsonArray(form.get("servicesFor")),
    serviceLocations: parseJsonArray(form.get("serviceLocations")),
    status: form.get("status") || "published",
  });
}

function collectPhotoFiles(form: FormData) {
  const photoFiles = form
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const single = form.get("photo");
  if (single instanceof File && single.size > 0) {
    photoFiles.unshift(single);
  }

  return photoFiles;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    const [listings, limits] = await Promise.all([
      prisma.listing.findMany({
        where: { userId: user.id },
        include: { user: { select: { lastLoginAt: true } } },
        orderBy: [{ isLuxo: "desc" }, { createdAt: "desc" }],
      }),
      getListingLimits(user.id),
    ]);

    return Response.json({
      count: listings.length,
      listings: listings.map(toListingSummary),
      limits,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Não foi possível carregar os anúncios.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    if (user.role !== "acompanhante") {
      return jsonError("Apenas acompanhantes podem criar anúncios.", 403);
    }

    if (user.verificationStatus !== "verified") {
      return jsonError("Confirme seu cadastro no perfil antes de anunciar.", 403);
    }

    await assertCanCreateListing(user.id);

    const form = await request.formData();
    const parsed = readListingFields(form);

    await assertCanPublishListing(user.id, { nextStatus: parsed.status });

    const photoFiles = collectPhotoFiles(form);

    if (photoFiles.length === 0) {
      return jsonError("Envie pelo menos 1 foto do anúncio.");
    }

    if (photoFiles.length > 5) {
      return jsonError("No máximo 5 fotos por anúncio.");
    }

    const uploaded = await uploadImagesToS3(
      photoFiles.slice(0, 5),
      `listings/${user.id}`,
    );
    const photos = uploaded.map((item) => item.url);
    const nsfwPhotos = uploaded
      .filter((item) => item.isNsfw)
      .map((item) => item.url);

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        title: parsed.title,
        description: parsed.description,
        pricePerHour: parsed.pricePerHour,
        age: parsed.age,
        gender: parsed.gender,
        region: parsed.region,
        city: parsed.city,
        neighborhood: parsed.neighborhood,
        phone: parsed.phone || user.phone,
        whatsapp: parsed.whatsapp || user.phone,
        services: parsed.services,
        servicesFor: parsed.servicesFor,
        serviceLocations: parsed.serviceLocations,
        online: isOnlineFromLastLogin(user.lastLoginAt),
        status: parsed.status,
        photoUrl: photos[0] ?? null,
        photos,
        nsfwPhotos,
      },
    });

    const limits = await getListingLimits(user.id);

    return Response.json(
      { listing: toListingSummary(listing), limits },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o anúncio.";
    console.error(error);
    return jsonError(message, 400);
  }
}
