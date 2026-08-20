import Script from "next/script";
import { getRecaptchaSiteKey } from "@/lib/recaptcha-client";

/** Carrega o script do reCAPTCHA v3 (só em produção). */
export function RecaptchaScript() {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) return null;

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
    />
  );
}
