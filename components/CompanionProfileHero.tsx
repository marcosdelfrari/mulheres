"use client";

import Image from "next/image";
import { isNsfwPhoto } from "@/lib/companion-utils";
import type { Companion, Region } from "@/lib/types";
import { AgeRestrictedMedia } from "./AgeRestrictedMedia";
import { CompanionDistance } from "./CompanionDistance";
import { VerifiedBadge, OnlineBadge } from "./VerifiedBadge";

const REGION_UF: Record<Region, string> = {
  "São Paulo": "SP",
  "Rio de Janeiro": "RJ",
  "Minas Gerais": "MG",
  Paraná: "PR",
  Bahia: "BA",
  "Distrito Federal": "DF",
};

function formatServicesFor(servicesFor: string[]): string {
  if (servicesFor.length === 0) return "";
  const lower = servicesFor.map((s) => s.toLowerCase());
  if (lower.length === 1) return `atende ${lower[0]}`;
  const last = lower.pop();
  return `atende ${lower.join(", ")} e ${last}`;
}

interface CompanionProfileHeroProps {
  companion: Companion;
}

export function CompanionProfileHero({ companion }: CompanionProfileHeroProps) {
  const profilePhoto = companion.photos[0];
  const uf = REGION_UF[companion.region];
  const hasLocal = companion.serviceLocations.includes("Em casa");

  return (
    <section className="mx-auto max-w-3xl px-4 pt-2 sm:px-6">
      <div className="flex items-center gap-3">
        <AgeRestrictedMedia
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:h-24 sm:w-24"
          interactive={false}
          restricted={isNsfwPhoto(companion.nsfwPhotos, profilePhoto)}
        >
          {profilePhoto ? (
            <Image
              src={profilePhoto}
              alt={companion.name}
              fill
              className="object-cover"
              sizes="88px"
              priority
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xl font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${companion.avatarColor}, #3d1a5c)`,
              }}
            >
              {companion.name.slice(0, 1)}
            </div>
          )}
        </AgeRestrictedMedia>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="font-serif text-xl font-bold italic leading-tight text-gray-900 sm:text-2xl">
              {companion.name}
            </h1>
            <VerifiedBadge verified={companion.verified} size="sm" />
            <OnlineBadge online={companion.online} />
          </div>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            {companion.gender ?? "Mulher"} · {companion.age} anos
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs font-bold text-luxury-accent">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Valores
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-gray-900">
            R$ {companion.pricePerHour}
            <span className="font-normal text-gray-500"> /h</span>
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {formatServicesFor(companion.servicesFor)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs font-bold text-luxury-accent">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Localização
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-gray-900">
            {companion.neighborhood}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {companion.city} - {uf}
            {hasLocal && " · com local"}
          </p>
          <div className="mt-1">
            <CompanionDistance companion={companion} />
          </div>
        </div>
      </div>
    </section>
  );
}
