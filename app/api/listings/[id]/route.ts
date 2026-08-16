import { z } from "zod";
import {
  getCurrentUser,
  jsonError,
  toListingSummary,
} from "@/lib/auth";
import {
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

const updateSchema = z.object({
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
  keepPhotos: z.array(z.string()).default([]),
});

const statusOnlySchema = z.object({
  status: z.enum(["draft", "published", "paused"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    const contentType = request.headers.get("content-type") ?? "";

    // Status-only toggle (pausar / reativar) via JSON.
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { status?: string };
      const parsed = statusOnlySchema.parse(body);

      if (
        parsed.status === "published" &&
        existing.status !== "published"
      ) {
        await assertCanPublishListing(user.id, {
          excludeId: existing.id,
          nextStatus: "published",
        });
      }

      const listing = await prisma.listing.update({
        where: { id: existing.id },
        data: { status: parsed.status },
      });

      return Response.json({
        listing: toListingSummary(listing),
        limits: await getListingLimits(user.id),
      });
    }

    const form = await request.formData();
    const parsed = updateSchema.parse({
      title: form.get("title"),
      description: form.get("description"),
      pricePerHour: form.get("pricePerHour"),
      age: form.get("age") || existing.age,
      gender: form.get("gender") || existing.gender,
      region: form.get("region") || existing.region,
      city: form.get("city") || existing.city,
      neighborhood: form.get("neighborhood") || existing.neighborhood,
      phone: form.get("phone") || undefined,
      whatsapp: form.get("whatsapp") || undefined,
      services: parseJsonArray(form.get("services")),
      servicesFor: parseJsonArray(form.get("servicesFor")),
      serviceLocations: parseJsonArray(form.get("serviceLocations")),
      status: form.get("status") || existing.status,
      keepPhotos: parseJsonArray(form.get("keepPhotos")),
    });

    if (
      parsed.status === "published" &&
      existing.status !== "published"
    ) {
      await assertCanPublishListing(user.id, {
        excludeId: existing.id,
        nextStatus: "published",
      });
    }

    const newPhotoFiles = form
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    const kept = parsed.keepPhotos.filter((url) =>
      existing.photos.includes(url),
    );

    if (kept.length + newPhotoFiles.length === 0) {
      return jsonError("O anúncio precisa de pelo menos 1 foto.");
    }

    if (kept.length + newPhotoFiles.length > 5) {
      return jsonError("No máximo 5 fotos por anúncio.");
    }

    const uploaded = newPhotoFiles.length
      ? await uploadImagesToS3(newPhotoFiles, `listings/${user.id}`)
      : [];

    const uploadedUrls = uploaded.map((item) => item.url);
    const photos = [...kept, ...uploadedUrls].slice(0, 5);
    const keptNsfw = kept.filter((url) => existing.nsfwPhotos.includes(url));
    const uploadedNsfw = uploaded
      .filter((item) => item.isNsfw)
      .map((item) => item.url);
    const nsfwPhotos = [...keptNsfw, ...uploadedNsfw].filter((url) =>
      photos.includes(url),
    );

    const listing = await prisma.listing.update({
      where: { id: existing.id },
      data: {
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
        status: parsed.status,
        photoUrl: photos[0] ?? null,
        photos,
        nsfwPhotos,
      },
    });

    return Response.json({
      listing: toListingSummary({
        ...listing,
        user: { lastLoginAt: user.lastLoginAt ?? null },
      }),
      limits: await getListingLimits(user.id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    const message =
      error instanceof Error ? error.message : "Não foi possível salvar o anúncio.";
    console.error(error);
    return jsonError(message, 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Anúncio não encontrado.", 404);
    }

    await prisma.listing.delete({ where: { id: existing.id } });

    return Response.json({
      ok: true,
      limits: await getListingLimits(user.id),
    });
  } catch (error) {
    console.error(error);
    return jsonError("Não foi possível excluir o anúncio.", 500);
  }
}
