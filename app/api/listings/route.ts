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
import { listingWriteSchema } from "@/lib/listing-form";
import { resolveOwnedListingPhotos } from "@/lib/listing-photos";
import { prisma } from "@/lib/prisma";

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
      getListingLimits(user),
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

    await assertCanCreateListing(user);

    const parsed = listingWriteSchema.parse(await request.json());
    await assertCanPublishListing(user, { nextStatus: parsed.status });

    const { photos, photoUrl, nsfwPhotos } = await resolveOwnedListingPhotos(
      parsed.photos,
      user.id,
      { avatar: parsed.photoUrl },
    );

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
        photoUrl,
        photos,
        nsfwPhotos,
      },
    });

    const limits = await getListingLimits(user);

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
