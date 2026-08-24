import {
  classifyNewListingPhotos,
  isOwnedListingPhotoUrl,
  pickListingAvatar,
} from "@/lib/s3";

export async function resolveOwnedListingPhotos(
  urls: string[],
  userId: string,
  options: {
    allowedExisting?: string[];
    avatar?: string | null;
    alreadyNsfw?: string[];
  } = {},
) {
  const allowed = new Set(options.allowedExisting ?? []);
  const unique = [...new Set(urls)];
  const valid = unique.filter(
    (url) => allowed.has(url) || isOwnedListingPhotoUrl(url, userId),
  );

  if (valid.length === 0) {
    throw new Error("O anúncio precisa de pelo menos 1 foto.");
  }
  if (valid.length !== unique.length) {
    throw new Error("Uma ou mais fotos são inválidas.");
  }

  const { photos, photoUrl } = pickListingAvatar(valid, options.avatar);
  const nsfwPhotos = await classifyNewListingPhotos(
    photos,
    options.alreadyNsfw,
  );

  return { photos, photoUrl, nsfwPhotos };
}
