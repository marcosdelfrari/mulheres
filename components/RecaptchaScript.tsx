import Script from "next/script";

/** Carrega o script do reCAPTCHA v3 quando a site key está configurada. */
export function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  if (!siteKey) return null;

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
    />
  );
}
