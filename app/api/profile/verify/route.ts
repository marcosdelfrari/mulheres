import { getCurrentUser, jsonError, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Faça login para continuar.", 401);
    }

    if (user.role === "cliente") {
      return jsonError("Clientes não precisam verificar o cadastro.");
    }

    if (user.verificationStatus === "verified") {
      return Response.json({ user: toAuthUser(user) });
    }

    const form = await request.formData();
    const method = String(form.get("method") ?? "");
    const file = form.get("file");

    if (method !== "documento" && method !== "foto_perfil") {
      return jsonError("Escolha documento ou foto de perfil.");
    }

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Envie uma foto para confirmar o cadastro.");
    }

    const photoUrl = await uploadImageToS3(
      file,
      method === "documento"
        ? `verification/${user.id}/document`
        : `verification/${user.id}/profile`,
    );

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: "verified",
        verificationMethod: method,
        verifiedAt: new Date(),
        ...(method === "documento"
          ? { documentPhotoUrl: photoUrl }
          : { profilePhotoUrl: photoUrl }),
      },
    });

    return Response.json({
      user: toAuthUser(updated),
      message: "Cadastro confirmado. Você já pode criar anúncios.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha na verificação.";
    console.error(error);
    return jsonError(message, 400);
  }
}
