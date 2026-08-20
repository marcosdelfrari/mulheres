declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
}

function waitForGrecaptcha(timeoutMs = 8000) {
  return new Promise<NonNullable<Window["grecaptcha"]>>((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.grecaptcha?.execute) {
        resolve(window.grecaptcha);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("reCAPTCHA não carregou. Atualize a página."));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

/** Obtém token reCAPTCHA v3 para a ação informada. */
export async function getRecaptchaToken(action: string): Promise<string> {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) return "";

  const grecaptcha = await waitForGrecaptcha();
  await new Promise<void>((resolve) => {
    grecaptcha.ready(() => resolve());
  });
  return grecaptcha.execute(siteKey, { action });
}
