"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function CreateListingFab() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading || !user) return null;
  if (user.role !== "acompanhante") return null;
  if (user.verificationStatus !== "verified") return null;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const openCreate = () => {
    if (pathname === "/conta") {
      window.dispatchEvent(new CustomEvent("mdlx:open-create-listing"));
      return;
    }
    router.push("/conta?novo=1");
  };

  return (
    <button
      type="button"
      onClick={openCreate}
      aria-label="Criar anúncio"
      title="Criar anúncio"
      className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-luxury-accent text-[#0c0414] shadow-[0_4px_14px_rgba(12,4,20,0.22)] transition-transform hover:scale-105 hover:bg-luxury-accent-hover active:scale-95 sm:bottom-28 sm:right-8"
    >
      <Plus className="h-7 w-7 animate-pulse" strokeWidth={2.5} aria-hidden />
      <span className="sr-only">Criar anúncio</span>
    </button>
  );
}
