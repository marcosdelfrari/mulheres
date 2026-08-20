const MIN_SCORE = 0.5;

type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

/**
 * Valida token reCAPTCHA v3 no servidor (siteverify).
 * Se a secret não estiver configurada fora de produção, ignora (dev local).
 */
export async function assertRecaptcha(
  token: string | undefined,
  expectedAction: string,
) {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("reCAPTCHA não configurado no servidor.");
    }
    return;
  }

  if (!token?.trim()) {
    throw new Error("Falha na verificação anti-bot. Atualize a página e tente de novo.");
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error("Não foi possível validar o reCAPTCHA. Tente de novo.");
  }

  const data = (await res.json()) as RecaptchaVerifyResponse;

  if (!data.success) {
    console.error("[recaptcha] siteverify failed:", data["error-codes"]);
    throw new Error("Verificação anti-bot rejeitada. Atualize a página e tente de novo.");
  }

  if (typeof data.score === "number" && data.score < MIN_SCORE) {
    throw new Error("Atividade suspeita detectada. Tente novamente mais tarde.");
  }

  if (data.action && data.action !== expectedAction) {
    throw new Error("Verificação anti-bot inválida.");
  }
}
