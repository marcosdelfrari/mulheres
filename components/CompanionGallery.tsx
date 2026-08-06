"use client";

import Image from "next/image";
import { useState } from "react";
import { useAgeGate } from "@/lib/age-gate-context";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";

interface CompanionGalleryProps {
  photos: string[];
  name: string;
  variant?: "default" | "embedded";
}

export function CompanionGallery({
  photos,
  name,
  variant = "default",
}: CompanionGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const { verified, requestVerification } = useAgeGate();

  if (photos.length === 0) return null;

  const isEmbedded = variant === "embedded";

  const openFullscreen = () => {
    if (!verified) {
      requestVerification();
      return;
    }
    setFullscreen(true);
  };

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
            <h2 className="font-serif text-sm font-semibold italic tracking-tight text-gray-500">
              Galeria de fotos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {photos.length} foto{photos.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={openFullscreen}
          className={`relative block aspect-[4/5] w-full overflow-hidden bg-gray-100 ${
            isEmbedded ? "max-h-[480px] rounded-2xl" : "max-h-[520px]"
          }`}
          aria-label={
            verified
              ? `Ampliar foto de ${name}`
              : "Verificar idade para ver a foto"
          }
        >
          <AgeRestrictedMedia className="absolute inset-0" interactive={false}>
            <Image
              src={photos[activeIndex]}
              alt={`${name} — foto ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </AgeRestrictedMedia>
        </button>

        <div className={`flex gap-2 overflow-x-auto ${isEmbedded ? "pt-4" : "p-4 sm:p-5"}`}>
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              onClick={() => {
                if (!verified) {
                  requestVerification();
                  return;
                }
                setActiveIndex(index);
              }}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                index === activeIndex
                  ? "border-luxury-accent"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Ver foto ${index + 1} de ${name}`}
            >
              <AgeRestrictedMedia className="absolute inset-0" interactive={false}>
                <Image
                  src={photo}
                  alt={`${name} — miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </AgeRestrictedMedia>
            </button>
          ))}
        </div>
      </section>

      {fullscreen && verified && (
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
            <Image
              src={photos[activeIndex]}
              alt={`${name} — foto ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
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
                    setActiveIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full ${
                    index === activeIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={`Foto ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
