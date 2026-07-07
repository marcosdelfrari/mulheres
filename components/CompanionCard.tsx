import Image from "next/image";
import Link from "next/link";
import type { Companion } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
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

  return (
    <Link
      href={`/acompanhante/${companion.id}`}
      className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white transition-colors hover:border-purple-300"
    >
      <div className="relative aspect-[3/4] max-h-56 overflow-hidden bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={companion.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 320px"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-2xl font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${companion.avatarColor}, #a78bfa)`,
            }}
          >
            {companion.name.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <VerifiedBadge verified={companion.verified} size="sm" />
            <OnlineBadge online={companion.online} />
          </div>
          <h3 className="font-serif text-lg font-bold italic text-gray-900">{companion.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {companion.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {companion.services.slice(0, 2).map((service) => (
            <span
              key={service}
              className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm font-bold text-gray-700">
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
          <span className="font-bold text-purple-700">
            R$ {companion.pricePerHour}/h
          </span>
        </div>
      </div>
    </Link>
  );
}
