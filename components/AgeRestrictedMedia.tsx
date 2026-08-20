"use client";

import type { ReactNode, MouseEvent } from "react";
import { useAgeGate } from "@/lib/age-gate-context";

interface AgeRestrictedMediaProps {
  children: ReactNode;
  className?: string;
  /** Quando true, o clique abre o gate se ainda não verificado */
  interactive?: boolean;
  /**
   * Se false, renderiza a mídia sem blur (ex.: avatar sem foto).
   * Default true — conteúdo adulto fica borrado até a verificação facial.
   */
  restricted?: boolean;
}

/**
 * Aplica blur em mídia adulta até a verificação etária.
 * Clique (se interactive) abre o popup ECA.
 */
export function AgeRestrictedMedia({
  children,
  className = "",
  interactive = true,
  restricted = true,
}: AgeRestrictedMediaProps) {
  const { verified, requestVerification } = useAgeGate();

  const onActivate = (e: MouseEvent) => {
    if (verified) return;
    e.preventDefault();
    e.stopPropagation();
    requestVerification();
  };

  if (!restricted || verified) {
    return (
      <div className={`relative h-full w-full ${className}`}>{children}</div>
    );
  }

  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden ${className}`}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                requestVerification();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? "Conteúdo protegido. Clique para verificar idade."
          : undefined
      }
    >
      {/* Camada com tamanho explícito — sem isso o blur colapsa e a foto some (fica preto). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 scale-110 select-none blur-[18px] brightness-90 contrast-95 saturate-50"
      >
        <div className="relative h-full w-full">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-black/25" />
      {interactive ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
          <span className="rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm sm:text-xs">
            +18 · Verificar
          </span>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-2 pb-3">
          <span className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
            +18
          </span>
        </div>
      )}
    </div>
  );
}
