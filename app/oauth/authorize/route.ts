import {
  OAUTH_CLIENT_ID,
  createAuthorizationCodeValue,
  storeAuthorizationCode,
  validateClient,
  authenticateResourceOwner,
} from "@/lib/oauth";
import { getCurrentUser, markUserLogin } from "@/lib/auth";

export const runtime = "nodejs";

function htmlPage(body: string) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Autorizar acesso — Mulheres de Luxo</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#0c0414;color:#fff;margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}
    .card{width:100%;max-width:420px;background:#160a24;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px}
    h1{font-size:1.4rem;margin:0 0 8px}
    p{color:rgba(255,255,255,.65);line-height:1.5}
    label{display:block;margin:16px 0 6px;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.5)}
    input{width:100%;box-sizing:border-box;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:#fff;padding:14px 18px;font-size:1rem}
    button{margin-top:20px;width:100%;border:0;border-radius:999px;background:#c5a059;color:#0c0414;font-weight:700;padding:14px 18px;font-size:1rem;cursor:pointer}
    .err{color:#fca5a5;margin-top:12px}
  </style>
</head>
<body>${body}</body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id") ?? "";
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";
  const responseType = url.searchParams.get("response_type") ?? "";
  const scope = url.searchParams.get("scope") ?? "openid profile email";
  const state = url.searchParams.get("state") ?? "";
  const codeChallenge = url.searchParams.get("code_challenge");
  const codeChallengeMethod = url.searchParams.get("code_challenge_method");

  if (responseType !== "code") {
    return new Response("unsupported_response_type", { status: 400 });
  }
  if (!validateClient(clientId, null, "none") || !redirectUri) {
    return new Response("invalid_client or redirect_uri", { status: 400 });
  }

  const sessionUser = await getCurrentUser();
  if (sessionUser) {
    const code = createAuthorizationCodeValue();
    await storeAuthorizationCode({
      code,
      userId: sessionUser.id,
      clientId,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod,
    });
    const target = new URL(redirectUri);
    target.searchParams.set("code", code);
    if (state) target.searchParams.set("state", state);
    return Response.redirect(target.toString(), 302);
  }

  const body = `
  <div class="card">
    <h1>Autorizar agente</h1>
    <p>O cliente <strong>${escapeHtml(clientId)}</strong> pede acesso à sua conta Mulheres de Luxo.</p>
    <form method="post">
      <input type="hidden" name="client_id" value="${escapeHtml(clientId)}" />
      <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}" />
      <input type="hidden" name="scope" value="${escapeHtml(scope)}" />
      <input type="hidden" name="state" value="${escapeHtml(state)}" />
      <input type="hidden" name="code_challenge" value="${escapeHtml(codeChallenge ?? "")}" />
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(codeChallengeMethod ?? "")}" />
      <label>E-mail</label>
      <input type="email" name="email" required autocomplete="username" />
      <label>Senha</label>
      <input type="password" name="password" required autocomplete="current-password" />
      <button type="submit">Entrar e autorizar</button>
    </form>
  </div>`;

  return new Response(htmlPage(body), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const clientId = String(form.get("client_id") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const scope = String(form.get("scope") ?? "openid profile email");
  const state = String(form.get("state") ?? "");
  const codeChallenge = String(form.get("code_challenge") ?? "") || null;
  const codeChallengeMethod =
    String(form.get("code_challenge_method") ?? "") || null;
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!validateClient(clientId, null, "none") || !redirectUri) {
    return new Response("invalid_client", { status: 400 });
  }

  const user = await authenticateResourceOwner(email, password);
  if (!user) {
    const body = `
    <div class="card">
      <h1>Autorizar agente</h1>
      <p class="err">E-mail ou senha inválidos.</p>
      <p><a href="/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}" style="color:#c5a059">Tentar de novo</a></p>
    </div>`;
    return new Response(htmlPage(body), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  await markUserLogin(user.id);

  const code = createAuthorizationCodeValue();
  await storeAuthorizationCode({
    code,
    userId: user.id,
    clientId,
    redirectUri,
    scope,
    codeChallenge,
    codeChallengeMethod,
  });

  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);
  return Response.redirect(target.toString(), 302);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
