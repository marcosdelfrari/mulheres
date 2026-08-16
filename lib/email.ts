import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }
  return new Resend(apiKey);
}

function getFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL ??
    "Mulheres de Luxo <contato@mulheresdeluxo.com.br>"
  );
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: input.to,
    subject: "Redefinir sua senha — Mulheres de Luxo",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 22px; font-weight: normal;">Recuperação de senha</h1>
        <p style="font-size: 15px; line-height: 1.6;">
          Recebemos um pedido para redefinir a senha da sua conta.
          Clique no botão abaixo para escolher uma nova senha. O link expira em 1 hora.
        </p>
        <p style="margin: 28px 0;">
          <a href="${input.resetUrl}"
             style="display: inline-block; background: #c9a84c; color: #0c0414; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size: 13px; line-height: 1.5; color: #666;">
          Se você não solicitou esta alteração, ignore este e-mail.
        </p>
        <p style="font-size: 12px; color: #999; word-break: break-all;">
          Ou copie e cole este link no navegador:<br />${input.resetUrl}
        </p>
      </div>
    `,
    text: `Recuperação de senha — Mulheres de Luxo\n\nUse este link para redefinir sua senha (válido por 1 hora):\n${input.resetUrl}\n\nSe você não solicitou esta alteração, ignore este e-mail.`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
