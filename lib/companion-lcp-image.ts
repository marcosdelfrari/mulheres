import { getImageProps } from "next/image";
import { companionPhotoAlt } from "@/lib/companion-utils";
import type { Companion } from "@/lib/types";

export const COMPANION_GALLERY_LCP_WIDTH = 480;
export const COMPANION_GALLERY_LCP_HEIGHT = 640;
export const COMPANION_GALLERY_LCP_SIZES =
  "(max-width: 768px) calc(100vw - 2rem), 480px";

export function getCompanionGalleryCoverIndex(companion: Companion): number {
  const index = companion.photos.indexOf(companion.coverPhoto);
  return index >= 0 ? index : 0;
}

export function getCompanionGalleryLcpPreload(companion: Companion) {
  const photos = companion.photos;
  if (photos.length === 0) return null;

  const index = getCompanionGalleryCoverIndex(companion);
  const photo = photos[index]!;

  const { props } = getImageProps({
    alt: companionPhotoAlt(companion, {
      index: index + 1,
      total: photos.length,
    }),
    src: photo,
    width: COMPANION_GALLERY_LCP_WIDTH,
    height: COMPANION_GALLERY_LCP_HEIGHT,
    quality: 80,
    sizes: COMPANION_GALLERY_LCP_SIZES,
  });

  if (!props.src) return null;

  return {
    href: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes,
  };
}
