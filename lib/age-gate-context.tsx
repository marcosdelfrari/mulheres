"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readAgeVerifiedCookie,
  writeAgeVerifiedCookie,
} from "@/lib/age-gate";
import { useAuth } from "@/lib/auth-context";

interface AgeGateContextValue {
  /** Cookie / auth já resolvidos no cliente */
  ready: boolean;
  verified: boolean;
  open: boolean;
  requestVerification: () => void;
  closeVerification: () => void;
  completeVerification: () => void;
}

const AgeGateContext = createContext<AgeGateContextValue | null>(null);

export function AgeGateProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [cookieVerified, setCookieVerified] = useState(false);
  const [cookieReady, setCookieReady] = useState(false);
  const [open, setOpen] = useState(false);

  const isLoggedIn = Boolean(user);
  const verified = isLoggedIn || cookieVerified;
  const ready = cookieReady && !authLoading;

  useEffect(() => {
    setCookieVerified(readAgeVerifiedCookie());
    setCookieReady(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setOpen(false);
    }
  }, [isLoggedIn]);

  const requestVerification = useCallback(() => {
    if (user || readAgeVerifiedCookie()) {
      setCookieVerified(true);
      return;
    }
    setOpen(true);
  }, [user]);

  const closeVerification = useCallback(() => {
    setOpen(false);
  }, []);

  const completeVerification = useCallback(() => {
    writeAgeVerifiedCookie();
    setCookieVerified(true);
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      verified,
      open: isLoggedIn ? false : open,
      requestVerification,
      closeVerification,
      completeVerification,
    }),
    [
      ready,
      verified,
      isLoggedIn,
      open,
      requestVerification,
      closeVerification,
      completeVerification,
    ],
  );

  return (
    <AgeGateContext.Provider value={value}>{children}</AgeGateContext.Provider>
  );
}

export function useAgeGate() {
  const ctx = useContext(AgeGateContext);
  if (!ctx) {
    throw new Error("useAgeGate deve ser usado dentro de AgeGateProvider");
  }
  return ctx;
}
