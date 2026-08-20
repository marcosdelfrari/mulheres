"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Megaphone, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { ListingSummary } from "@/lib/auth-types";

type PromptKind = "welcome" | "pending" | null;

function storageKey(kind: "welcome" | "pending", userId: string) {
  return `mdlx-listing-prompt:${kind}:${userId}`;
}

function wasWelcomeDismissed(userId: string) {
  try {
    return localStorage.getItem(storageKey("welcome", userId)) === "1";
  } catch {
    return false;
  }
}

function dismissWelcome(userId: string) {
  try {
    localStorage.setItem(storageKey("welcome", userId), "1");
  } catch {
    /* ignore */
  }
}

function pendingFingerprint(ids: string[]) {
  return ids.slice().sort().join(",");
}

function wasPendingDismissed(userId: string, fingerprint: string) {
  try {
    return localStorage.getItem(storageKey("pending", userId)) === fingerprint;
  } catch {
    return false;
  }
}

function dismissPending(userId: string, fingerprint: string) {
  try {
    localStorage.setItem(storageKey("pending", userId), fingerprint);
  } catch {
    /* ignore */
  }
}

export function CompanionListingPrompt() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [kind, setKind] = useState<PromptKind>(null);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const evaluate = useCallback(async () => {
    if (!user || user.role !== "acompanhante") {
      setKind(null);
      return;
    }
    if (user.verificationStatus !== "verified") {
      setKind(null);
      return;
    }

    try {
      const res = await fetch("/api/listings", { credentials: "include" });
      if (!res.ok) {
        setKind(null);
        return;
      }
      const data = (await res.json()) as {
        listings?: ListingSummary[];
      };
      const listings = data.listings ?? [];

      if (listings.length === 0) {
        if (!wasWelcomeDismissed(user.id)) {
          setKind("welcome");
          setPendingTitle(null);
          setPendingIds([]);
        } else {
          setKind(null);
        }
        return;
      }

      const pending = listings.filter(
        (item) => item.status === "draft" || item.status === "paused",
      );
      const hasPublished = listings.some((item) => item.status === "published");
      const fingerprint = pendingFingerprint(pending.map((item) => item.id));

      if (pending.length > 0 && !wasPendingDismissed(user.id, fingerprint)) {
        setKind("pending");
        setPendingTitle(pending[0]?.title ?? null);
        setPendingIds(pending.map((item) => item.id));
        return;
      }

      if (!hasPublished && !wasWelcomeDismissed(user.id)) {
        setKind("welcome");
        setPendingTitle(null);
        setPendingIds([]);
        return;
      }

      setKind(null);
    } catch {
      setKind(null);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    void evaluate();
  }, [isLoading, evaluate, pathname]);

  if (!kind || !user) return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
    return null;
  }

  const close = () => {
    if (kind === "welcome") dismissWelcome(user.id);
    else dismissPending(user.id, pendingFingerprint(pendingIds));
    setKind(null);
  };

  const goCreate = () => {
    dismissWelcome(user.id);
    setKind(null);
    if (pathname === "/conta") {
      window.dispatchEvent(new CustomEvent("mdlx:open-create-listing"));
      return;
    }
    router.push("/conta?novo=1");
  };

  const goAccount = () => {
    dismissPending(user.id, pendingFingerprint(pendingIds));
    setKind(null);
    router.push("/conta");
  };

  const isWelcome = kind === "welcome";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-prompt-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 pb-2 pt-8 ${
            isWelcome
              ? "bg-gradient-to-br from-[#1a0a24] via-[#0c0414] to-[#2a1038]"
              : "bg-gradient-to-br from-amber-50 to-white"
          }`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              isWelcome
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              isWelcome
                ? "bg-luxury-accent text-[#0c0414]"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isWelcome ? (
              <Sparkles className="h-7 w-7" strokeWidth={2} aria-hidden />
            ) : (
              <Megaphone className="h-7 w-7" strokeWidth={2} aria-hidden />
            )}
          </div>

          <h2
            id="listing-prompt-title"
            className={`text-center font-serif text-2xl font-bold italic ${
              isWelcome ? "text-white" : "text-gray-900"
            }`}
          >
            {isWelcome ? "Bem-vinda!" : "Anúncio pronto para publicar"}
          </h2>
          <p
            className={`mt-3 pb-6 text-center text-base leading-relaxed ${
              isWelcome ? "text-white/75" : "text-gray-600"
            }`}
          >
            {isWelcome
              ? "Sua conta está liberada. Crie seu primeiro anúncio e comece a receber contatos."
              : pendingTitle
                ? `Você tem “${pendingTitle}” aguardando. Publique ou reative para aparecer entre as modelos.`
                : "Você tem anúncio aguardando. Publique ou reative para aparecer entre as modelos."}
          </p>
        </div>

        <div className="flex flex-col gap-2 px-6 py-5">
          {isWelcome ? (
            <button
              type="button"
              onClick={goCreate}
              className="w-full rounded-full bg-luxury-accent py-3.5 text-base font-semibold text-[#0c0414] transition-colors hover:bg-luxury-accent-hover"
            >
              Fazer meu primeiro anúncio
            </button>
          ) : (
            <button
              type="button"
              onClick={goAccount}
              className="w-full rounded-full bg-[#0c0414] py-3.5 text-base font-semibold text-white transition-colors hover:bg-purple-900"
            >
              Ir para meus anúncios
            </button>
          )}
          <button
            type="button"
            onClick={close}
            className="w-full rounded-full py-3 text-base font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
