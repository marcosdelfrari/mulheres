"use client";

import Image from "next/image";
import { useState } from "react";
import { useAgeGate } from "@/lib/age-gate-context";
import { companionPhotoAlt, isNsfwPhoto } from "@/lib/companion-utils";
import {
  COMPANION_GALLERY_LCP_HEIGHT,
  COMPANION_GALLERY_LCP_SIZES,
  COMPANION_GALLERY_LCP_WIDTH,
  getCompanionGalleryCoverIndex,
} from "@/lib/companion-lcp-image";
import type { Companion } from "@/lib/types";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";

interface CompanionGalleryProps {
  photos: string[];
  nsfwPhotos?: string[];
  companion: Companion;
  variant?: "default" | "embedded";
}

function GalleryPhotoStack({
  photos,
  activeIndex,
  initialIndex,
  photoAlt,
  width,
  height,
  sizes,
  fit,
}: {
  photos: string[];
  activeIndex: number;
  initialIndex: number;
  photoAlt: (index: number) => string;
  width: number;
  height: number;
  sizes: string;
  fit: "cover" | "contain";
}) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <>
      {photos.map((photo, index) => {
        const isActive = index === activeIndex;
        const isLcp = index === initialIndex;
        return (
          <div
            key={`${photo}-${index}`}
            className={`absolute inset-0 ${
              isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={photo}
              alt=""
              width={64}
              height={80}
              className={`size-full ${fitClass}`}
              sizes="80px"
              quality={75}
            />
            <Image
              src={photo}
              alt={isActive ? photoAlt(index) : ""}
              width={width}
              height={height}
              className={`absolute inset-0 size-full ${fitClass}`}
              sizes={sizes}
              quality={80}
              priority={isLcp}
              fetchPriority={isLcp ? "high" : "low"}
              {...(isLcp ? {} : { loading: "eager" as const })}
            />
          </div>
        );
      })}
    </>
  );
}

export function CompanionGallery({
  photos,
  nsfwPhotos,
  companion,
  variant = "default",
}: CompanionGalleryProps) {
  const initialIndex = getCompanionGalleryCoverIndex(companion);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [fullscreen, setFullscreen] = useState(false);
  const { verified, requestVerification } = useAgeGate();

  if (photos.length === 0) return null;

  const isEmbedded = variant === "embedded";
  const mainWidth = isEmbedded ? COMPANION_GALLERY_LCP_WIDTH : 300;
  const mainHeight = isEmbedded
    ? COMPANION_GALLERY_LCP_HEIGHT
    : Math.round((300 * 4) / 3);
  const mainSizes = isEmbedded
    ? COMPANION_GALLERY_LCP_SIZES
    : `(max-width: 640px) min(calc(100vw - 2rem), 260px), ${mainWidth}px`;
  const activePhoto = photos[activeIndex]!;
  const activeIsNsfw = isNsfwPhoto(nsfwPhotos, activePhoto);
  const photoAlt = (index: number) =>
    companionPhotoAlt(companion, {
      index: index + 1,
      total: photos.length,
    });

  const openFullscreen = () => {
    if (activeIsNsfw && !verified) {
      requestVerification();
      return;
    }
    setFullscreen(true);
  };

  const selectPhoto = (index: number) => {
    const photo = photos[index];
    if (isNsfwPhoto(nsfwPhotos, photo) && !verified) {
      requestVerification();
      return;
    }
    setActiveIndex(index);
  };

  const stack = (
    <GalleryPhotoStack
      photos={photos}
      activeIndex={activeIndex}
      initialIndex={initialIndex}
      photoAlt={photoAlt}
      width={mainWidth}
      height={mainHeight}
      sizes={mainSizes}
      fit="cover"
    />
  );

  return (
    <>
      <section
        className={
          isEmbedded
            ? "overflow-hidden"
            : "overflow-hidden rounded-3xl border border-gray-100 bg-white"
        }
      >
        {!isEmbedded && (
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-light tracking-wide text-gray-500">
              Galeria de fotos
            </h2>
            <p className="mt-1 text-sm font-light text-gray-500">
              {photos.length} foto{photos.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={openFullscreen}
          className={`relative mx-auto block aspect-[3/4] w-full overflow-hidden bg-gray-100 ${
            isEmbedded
              ? "max-w-[480px] rounded-2xl"
              : "max-w-[260px] sm:max-w-[300px]"
          }`}
          aria-label={
            activeIsNsfw && !verified
              ? "Verificar idade para ver a foto"
              : `Ampliar ${photoAlt(activeIndex)}`
          }
        >
          <AgeRestrictedMedia
            className="absolute inset-0"
            interactive={false}
            restricted={activeIsNsfw}
          >
            {stack}
          </AgeRestrictedMedia>
        </button>

        <div
          className={`flex justify-center gap-2 overflow-x-auto ${isEmbedded ? "pt-4" : "p-4 sm:p-5"}`}
        >
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              onClick={() => selectPhoto(index)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                index === activeIndex
                  ? "border-luxury-accent"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Ver ${photoAlt(index)}`}
            >
              <AgeRestrictedMedia
                className="absolute inset-0"
                interactive={false}
                restricted={isNsfwPhoto(nsfwPhotos, photo)}
              >
                <Image
                  src={photo}
                  alt={photoAlt(index)}
                  width={64}
                  height={80}
                  className="size-full object-cover"
                  sizes="80px"
                  quality={75}
                />
              </AgeRestrictedMedia>
            </button>
          ))}
        </div>
      </section>

      {fullscreen && !(activeIsNsfw && !verified) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto em tela cheia"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white"
          >
            Fechar
          </button>

          <div
            className="relative h-[80vh] w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <GalleryPhotoStack
              photos={photos}
              activeIndex={activeIndex}
              initialIndex={initialIndex}
              photoAlt={photoAlt}
              width={mainWidth}
              height={mainHeight}
              sizes={mainSizes}
              fit="contain"
            />
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isNsfwPhoto(nsfwPhotos, photo) && !verified) {
                      requestVerification();
                      return;
                    }
                    setActiveIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full ${
                    index === activeIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={photoAlt(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
