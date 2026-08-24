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
import { listingWriteSchema, resolveListingContact } from "@/lib/listing-form";
import { resolveOwnedListingPhotos } from "@/lib/listing-photos";
import { prisma } from "@/lib/prisma";

const statusOnlySchema = z.object({
  status: z.enum(["draft", "published", "paused"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isStatusOnlyBody(body: unknown): body is { status: string } {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return "status" in record && !("title" in record) && !("photos" in record);
}

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

    const body = (await request.json()) as unknown;

    if (isStatusOnlyBody(body)) {
      const parsed = statusOnlySchema.parse(body);

      if (
        parsed.status === "published" &&
        existing.status !== "published"
      ) {
        await assertCanPublishListing(user, {
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
        limits: await getListingLimits(user),
      });
    }

    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const parsed = listingWriteSchema.parse({
      ...record,
      age: record.age || existing.age,
      gender: record.gender || existing.gender,
      region: record.region || existing.region,
      city: record.city || existing.city,
      neighborhood: record.neighborhood || existing.neighborhood,
      status: record.status || existing.status,
    });

    if (
      parsed.status === "published" &&
      existing.status !== "published"
    ) {
      await assertCanPublishListing(user, {
        excludeId: existing.id,
        nextStatus: "published",
      });
    }

    const { photos, photoUrl, nsfwPhotos } = await resolveOwnedListingPhotos(
      parsed.photos,
      user.id,
      {
        allowedExisting: existing.photos,
        avatar: parsed.photoUrl,
        alreadyNsfw: existing.nsfwPhotos,
      },
    );
    const contact = resolveListingContact(parsed, user.phone);

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
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        services: parsed.services,
        servicesFor: parsed.servicesFor,
        serviceLocations: parsed.serviceLocations,
        status: parsed.status,
        photoUrl,
        photos,
        nsfwPhotos,
      },
    });

    return Response.json({
      listing: toListingSummary({
        ...listing,
        user: { lastLoginAt: user.lastLoginAt ?? null },
      }),
      limits: await getListingLimits(user),
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
      limits: await getListingLimits(user),
    });
  } catch (error) {
    console.error(error);
    return jsonError("Não foi possível excluir o anúncio.", 500);
  }
}
