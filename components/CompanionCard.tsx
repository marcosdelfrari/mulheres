"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, User } from "lucide-react";
import {
  companionPhotoAlt,
  companionProfilePath,
  isNsfwPhoto,
} from "@/lib/companion-utils";
import type { Companion } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";
import { OnlineBadge, VerifiedBadge } from "./VerifiedBadge";

interface CompanionCardProps {
  companion: Companion;
  distanceKm?: number;
  locationMode?: "city" | "neighborhood";
}

function locationLabel(
  companion: Companion,
  locationMode?: "city" | "neighborhood",
) {
  if (locationMode === "city") return companion.city;
  if (locationMode === "neighborhood") {
    return [companion.neighborhood, companion.city].filter(Boolean).join(" · ");
  }
  return [companion.neighborhood, companion.city].filter(Boolean).join(" · ");
}

export function CompanionCard({
  companion,
  distanceKm,
  locationMode,
}: CompanionCardProps) {
  const photo = companion.coverPhoto || companion.photos[0];
  const premium = companion.sponsored;
  const photoCount = companion.photos.length;
  const place = locationLabel(companion, locationMode);

  return (
    <Link
      href={companionProfilePath(companion)}
      className={`flex w-full overflow-hidden rounded-3xl border bg-white transition-colors ${
        premium
          ? "flex-col border-luxury-accent/40 hover:border-luxury-accent/70"
          : "flex-row items-stretch border-gray-200 hover:border-luxury-accent/40 sm:flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-gray-100 ${
          premium
            ? "aspect-[3/4] w-full"
            : "w-[38%] max-w-[9.5rem] self-stretch min-h-[8.75rem] sm:aspect-[16/10] sm:w-full sm:max-w-none sm:min-h-0"
        }`}
      >
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
              className="object-cover object-top"
              sizes="(max-width: 640px) 38vw, (max-width: 1024px) 50vw, 320px"
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
        {companion.verified && (
          <span className="pointer-events-none absolute right-2 top-2 z-10 hidden sm:block">
            <VerifiedBadge verified size="sm" />
          </span>
        )}
        {premium ? (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-luxury-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0c0414]">
            ★ Premium
          </span>
        ) : null}
        {!premium && photoCount > 0 && (
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 z-10 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:hidden">
            <Camera className="h-3 w-3" aria-hidden />
            {photoCount}
          </span>
        )}
        {distanceKm !== undefined && (
          <span
            className={`pointer-events-none absolute right-1.5 top-1.5 z-10 max-w-[calc(100%-0.75rem)] truncate rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-luxury-accent backdrop-blur-sm sm:top-2 sm:px-2.5 sm:py-1 sm:text-xs ${
              companion.verified
                ? "sm:left-2 sm:right-auto"
                : "sm:right-2"
            }`}
          >
            {formatDistance(distanceKm)} de você
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <div className="min-w-0 flex-1">
          <div
            className={`mb-1.5 flex flex-wrap items-center gap-1 sm:mb-2 sm:gap-1.5 ${
              companion.verified && !companion.online ? "sm:hidden" : ""
            }`}
          >
            {companion.verified ? (
              <span className="sm:hidden">
                <VerifiedBadge verified size="sm" />
              </span>
            ) : (
              <VerifiedBadge verified={false} size="sm" />
            )}
            <OnlineBadge online={companion.online} />
          </div>
          <h3 className="line-clamp-2 text-base font-medium tracking-wide text-purple-900 sm:text-lg sm:font-light sm:text-gray-900">
            {companion.name}
          </h3>
          <p className="mt-1 line-clamp-3 text-xs font-light leading-relaxed text-gray-500 sm:line-clamp-2 sm:text-sm">
            {companion.bio}
          </p>
        </div>

        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {companion.services.slice(0, 2).map((service) => (
            <span
              key={service}
              className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-light text-gray-600"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto space-y-1 border-t border-gray-100 pt-2 sm:space-y-0 sm:pt-3">
          <div className="flex items-center gap-1.5 text-xs font-light text-gray-600 sm:hidden">
            <User className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
            <span>{companion.age} anos</span>
          </div>
          {place && (
            <div className="flex items-start gap-1.5 text-xs font-light text-gray-600 sm:hidden">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              <span className="line-clamp-2">{place}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 sm:pt-0">
            <span className="hidden text-sm font-light text-gray-700 sm:inline">
              {companion.age} anos
              {locationMode === "city" && (
                <span className="text-gray-600"> · {companion.city}</span>
              )}
              {locationMode === "neighborhood" && (
                <span className="text-gray-600"> · {companion.neighborhood}</span>
              )}
            </span>
            <span className="text-sm font-medium text-purple-800 sm:font-light">
              R$ {companion.pricePerHour}/h
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
