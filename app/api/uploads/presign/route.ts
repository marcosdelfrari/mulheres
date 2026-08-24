import { z } from "zod";
import { getCurrentUser, jsonError } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_LISTING_PHOTOS,
  MAX_PHOTO_BYTES,
  createListingPhotoPresign,
} from "@/lib/s3";

const presignSchema = z.object({
  files: z
    .array(
      z.object({
        contentType: z.string().trim().min(1),
        size: z.number().int().positive(),
      }),
    )
    .min(1, "Envie pelo menos 1 foto.")
    .max(MAX_LISTING_PHOTOS, "No máximo 5 fotos por anúncio."),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }
    if (user.role !== "acompanhante") {
      return jsonError("Apenas acompanhantes podem enviar fotos de anúncio.", 403);
    }

    const parsed = presignSchema.parse(await request.json());

    for (const file of parsed.files) {
      const contentType =
        file.contentType === "image/jpg" ? "image/jpeg" : file.contentType;
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          contentType as (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        return jsonError("Envie uma imagem (JPG, PNG ou WEBP).");
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return jsonError("Imagem muito grande. Máximo 2,5 MB.");
      }
    }

    const uploads = [];
    for (const file of parsed.files) {
      const contentType =
        file.contentType === "image/jpg" ? "image/jpeg" : file.contentType;
      uploads.push(await createListingPhotoPresign(user.id, contentType));
    }

    return Response.json({ uploads });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Dados inválidos.");
    }
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível preparar o envio das fotos.";
    console.error(error);
    return jsonError(message, 400);
  }
}
