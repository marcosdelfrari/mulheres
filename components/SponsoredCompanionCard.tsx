"use client";

import Image from "next/image";
import Link from "next/link";
import {
  companionPhotoAlt,
  companionProfilePath,
  isNsfwPhoto,
} from "@/lib/companion-utils";
import type { Companion } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";
import { OnlineBadge, VerifiedBadge } from "./VerifiedBadge";

interface SponsoredCompanionCardProps {
  companion: Companion;
  distanceKm?: number;
  locationMode?: "city" | "neighborhood";
  /** First visible card should be the LCP image (no lazy, fetchpriority=high). */
  priority?: boolean;
}

export function SponsoredCompanionCard({
  companion,
  distanceKm,
  locationMode,
  priority = false,
}: SponsoredCompanionCardProps) {
  const photo = companion.coverPhoto || companion.photos[0];

  return (
    <Link
      href={companionProfilePath(companion)}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-luxury-accent/35 bg-[#0c0414] transition-colors hover:border-luxury-accent/70 sm:flex-row sm:items-stretch"
    >
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-black/40 sm:aspect-auto sm:h-auto sm:w-48 sm:min-h-[12rem] sm:self-stretch">
        <AgeRestrictedMedia
          className="absolute inset-0"
          interactive={false}
          restricted={isNsfwPhoto(companion.nsfwPhotos, photo)}
        >
          {photo ? (
            <Image
              src={photo}
              alt={companionPhotoAlt(companion)}
              fill
              className="object-cover object-top transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 192px"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-2xl font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${companion.avatarColor}, #3d1a5c)`,
              }}
            >
              {companion.name.slice(0, 1)}
            </div>
          )}
        </AgeRestrictedMedia>
        {distanceKm !== undefined && (
          <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-luxury-accent backdrop-blur-sm">
            {formatDistance(distanceKm)} de você
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xl bg-luxury-accent px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[#0c0414]">
              ★ Destaque
            </span>
            <VerifiedBadge verified={companion.verified} size="sm" />
            <OnlineBadge online={companion.online} />
          </div>
          <h3 className="text-xl font-light tracking-wide text-white">
            {companion.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm font-light leading-relaxed text-white/60">
            {companion.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {companion.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-light text-white/80"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="text-sm font-light text-white/80">
            {companion.age} anos
            {locationMode === "city" && (
              <span className="text-white/50"> · {companion.city}</span>
            )}
            {locationMode === "neighborhood" && (
              <span className="text-white/50"> · {companion.neighborhood}</span>
            )}
          </span>
          <span className="text-lg font-light text-luxury-accent">
            R$ {companion.pricePerHour}/h
          </span>
        </div>
      </div>
    </Link>
  );
}
