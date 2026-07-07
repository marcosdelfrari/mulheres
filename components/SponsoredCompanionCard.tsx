import Image from "next/image";
import Link from "next/link";
import type { Companion } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import { OnlineBadge, VerifiedBadge } from "./VerifiedBadge";

interface SponsoredCompanionCardProps {
  companion: Companion;
  distanceKm?: number;
  locationMode?: "city" | "neighborhood";
}

export function SponsoredCompanionCard({
  companion,
  distanceKm,
  locationMode,
}: SponsoredCompanionCardProps) {
  return (
    <Link
      href={`/acompanhante/${companion.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border-2 border-purple-600 bg-gradient-to-br from-purple-50 via-white to-white transition-colors hover:border-purple-700 sm:flex-row sm:items-stretch"
    >
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-gray-100 sm:aspect-auto sm:h-auto sm:w-48 sm:self-stretch">
        <Image
          src={companion.photos[0]}
          alt={companion.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 192px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-xl bg-purple-700 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white">
              ★ Destaque
            </span>
            <VerifiedBadge verified={companion.verified} size="sm" />
            <OnlineBadge online={companion.online} />
          </div>
          <h3 className="font-serif text-xl font-bold italic text-gray-900">{companion.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {companion.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {companion.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-lg border border-purple-100 bg-white px-2 py-0.5 text-xs font-semibold text-purple-800"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-purple-100 pt-3">
          <span className="text-sm font-bold text-gray-800">
            {companion.age} anos
            {locationMode === "city" && (
              <span className="text-gray-600"> · {companion.city}</span>
            )}
            {locationMode === "neighborhood" && (
              <span className="text-gray-600"> · {companion.neighborhood}</span>
            )}
            {distanceKm !== undefined && (
              <span className="text-purple-700">
                {" "}
                · {formatDistance(distanceKm)} de você
              </span>
            )}
          </span>
          <span className="text-lg font-black text-purple-700">
            R$ {companion.pricePerHour}/h
          </span>
        </div>
      </div>
    </Link>
  );
}
