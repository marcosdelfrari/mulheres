import type { Companion } from "@/lib/types";

interface VerifiedBadgeProps {
  verified: boolean;
  size?: "sm" | "md";
}

export function VerifiedBadge({ verified, size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-xl font-bold bg-green-50 text-green-700 border border-green-100 ${sizeClasses}`}
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Verificada
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold bg-amber-50 text-amber-700 border border-amber-100 ${sizeClasses}`}
    >
      Pendente
    </span>
  );
}

export function OnlineBadge({ online }: { online: boolean }) {
  if (!online) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
      Online
    </span>
  );
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({
  companion,
  size = "md",
}: {
  companion: Companion;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-16 w-16 text-lg",
    md: "h-full w-full text-2xl",
    lg: "h-40 w-40 text-3xl",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-3xl font-black text-white ${sizeClasses[size]}`}
      style={{
        background: `linear-gradient(135deg, ${companion.avatarColor}, #3d1a5c)`,
      }}
    >
      {getInitials(companion.name)}
    </div>
  );
}
