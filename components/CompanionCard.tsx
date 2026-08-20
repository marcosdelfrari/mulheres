"use client";

import Image from "next/image";
import Link from "next/link";
import { companionProfilePath, isNsfwPhoto } from "@/lib/companion-utils";
import type { Companion } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";
import { OnlineBadge, VerifiedBadge } from "./VerifiedBadge";

interface CompanionCardProps {
  companion: Companion;
  distanceKm?: number;
  locationMode?: "city" | "neighborhood";
}

export function CompanionCard({
  companion,
  distanceKm,
  locationMode,
}: CompanionCardProps) {
  const photo = companion.photos[0];
  const premium = companion.sponsored;

  return (
    <Link
      href={companionProfilePath(companion)}
      className={`flex w-full flex-col overflow-hidden rounded-3xl border bg-white transition-colors ${
        premium
          ? "border-luxury-accent/40 hover:border-luxury-accent/70"
          : "border-gray-200 hover:border-luxury-accent/40"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-gray-100 ${
          premium ? "aspect-[3/4]" : "aspect-[16/10]"
        }`}
      >
        <AgeRestrictedMedia
          className="absolute inset-0 h-full w-full"
          interactive={false}
          restricted={isNsfwPhoto(companion.nsfwPhotos, photo)}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`${companion.name}, acompanhante em ${companion.neighborhood}, ${companion.city}`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
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
        {premium ? (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-luxury-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0c0414]">
            ★ Premium
          </span>
        ) : null}
        {distanceKm !== undefined && (
          <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-luxury-accent backdrop-blur-sm">
            {formatDistance(distanceKm)} de você
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <VerifiedBadge verified={companion.verified} size="sm" />
            <OnlineBadge online={companion.online} />
          </div>
          <h3 className="text-lg font-light tracking-wide text-gray-900">
            {companion.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm font-light leading-relaxed text-gray-500">
            {companion.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {companion.services.slice(0, 2).map((service) => (
            <span
              key={service}
              className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-light text-gray-600"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm font-light text-gray-700">
            {companion.age} anos
            {locationMode === "city" && (
              <span className="text-gray-600"> · {companion.city}</span>
            )}
            {locationMode === "neighborhood" && (
              <span className="text-gray-600"> · {companion.neighborhood}</span>
            )}
          </span>
          <span className="font-light text-purple-800">
            R$ {companion.pricePerHour}/h
          </span>
        </div>
      </div>
    </Link>
  );
}
