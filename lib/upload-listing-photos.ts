const MAX_PHOTO_BYTES = 2_500_000;
const MAX_EDGE = 1600;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function normalizeContentType(type: string) {
  if (type === "image/jpg" || !type) return "image/jpeg";
  return type;
}

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível preparar a imagem.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });
  if (!blob) {
    throw new Error("Não foi possível compactar a imagem.");
  }
  if (blob.size > MAX_PHOTO_BYTES) {
    throw new Error("Imagem muito grande. Máximo 2,5 MB.");
  }
  const name = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

export async function prepareListingPhoto(file: File): Promise<File> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem (JPG, PNG ou WEBP).");
  }
  const type = normalizeContentType(file.type);
  if (ALLOWED.has(type) && file.size <= MAX_PHOTO_BYTES) {
    return file.type === "image/jpg"
      ? new File([file], file.name, { type: "image/jpeg" })
      : file;
  }
  return compressImage(file);
}

export async function uploadListingPhotos(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const prepared = await Promise.all(files.map(prepareListingPhoto));
  const res = await fetch("/api/uploads/presign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: prepared.map((file) => ({
        contentType: normalizeContentType(file.type),
        size: file.size,
      })),
    }),
  });
  const data = (await res.json()) as {
    error?: string;
    uploads?: { uploadUrl: string; publicUrl: string; contentType: string }[];
  };
  if (!res.ok || !data.uploads) {
    throw new Error(data.error ?? "Não foi possível preparar o envio das fotos.");
  }
  if (data.uploads.length !== prepared.length) {
    throw new Error("Falha ao preparar o envio das fotos.");
  }

  await Promise.all(
    data.uploads.map(async (item, index) => {
      const file = prepared[index]!;
      let put: Response;
      try {
        put = await fetch(item.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": item.contentType },
          body: file,
        });
      } catch {
        throw new Error("Falha ao enviar foto. Tente de novo.");
      }
      if (!put.ok) {
        throw new Error("Falha ao enviar foto. Tente de novo.");
      }
    }),
  );

  return data.uploads.map((item) => item.publicUrl);
}
