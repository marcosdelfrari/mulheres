import {
  exchangeAssertionForTokens,
  getClaim,
  signIdentityAssertion,
} from "@/lib/agent-auth";
import { markUserLogin } from "@/lib/auth";
import {
  OAUTH_CLIENT_ID,
  authenticateResourceOwner,
  consumeAuthorizationCode,
  issueTokens,
  parseBasicAuth,
  validateClient,
} from "@/lib/oauth";

export const runtime = "nodejs";

function oauthError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    { status },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let params: URLSearchParams;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    params = new URLSearchParams(body);
  } else {
    const text = await request.text();
    params = new URLSearchParams(text);
  }

  const basic = parseBasicAuth(request.headers.get("authorization"));
  const clientId = basic?.clientId ?? params.get("client_id") ?? "";
  const clientSecret = basic?.clientSecret ?? params.get("client_secret");
  const grantType = params.get("grant_type") ?? "";

  if (grantType === "client_credentials") {
    if (!validateClient(clientId, clientSecret, "secret")) {
      return oauthError("invalid_client", "Client authentication failed.", 401);
    }
    // Machine client token without a user subject — use synthetic subject.
    const tokens = await issueTokens({
      userId: `client:${clientId}`,
      email: `${clientId}@clients.local`,
      name: clientId,
      clientId,
      scope: params.get("scope") ?? "openid",
    });
    return Response.json(tokens);
  }

  if (grantType === "password") {
    // Public agent clients may omit secret; confidential clients must send it.
    const authOk =
      validateClient(clientId, clientSecret, "secret") ||
      (clientId === OAUTH_CLIENT_ID && !clientSecret);
    if (!authOk && clientId !== OAUTH_CLIENT_ID) {
      return oauthError("invalid_client", "Unknown client.", 401);
    }

    const username = params.get("username") ?? "";
    const password = params.get("password") ?? "";
    const user = await authenticateResourceOwner(username, password);
    if (!user) {
      return oauthError("invalid_grant", "Invalid username or password.", 400);
    }

    await markUserLogin(user.id);

    const tokens = await issueTokens({
      userId: user.id,
      email: user.email,
      name: user.name,
      clientId,
      scope: params.get("scope") ?? "openid profile email",
    });
    return Response.json(tokens);
  }

  if (grantType === "authorization_code") {
    if (clientId !== OAUTH_CLIENT_ID) {
      return oauthError("invalid_client", "Unknown client.", 401);
    }
    // Confidential clients authenticate; public + PKCE may omit secret.
    if (clientSecret && !validateClient(clientId, clientSecret, "secret")) {
      return oauthError("invalid_client", "Client authentication failed.", 401);
    }

    const code = params.get("code") ?? "";
    const redirectUri = params.get("redirect_uri") ?? "";
    const codeVerifier = params.get("code_verifier") ?? undefined;
    const consumed = await consumeAuthorizationCode({
      code,
      clientId,
      redirectUri,
      codeVerifier,
    });
    if (!consumed) {
      return oauthError("invalid_grant", "Invalid or expired authorization code.");
    }

    const tokens = await issueTokens({
      userId: consumed.user.id,
      email: consumed.user.email,
      name: consumed.user.name,
      clientId,
      scope: consumed.scope,
    });
    return Response.json(tokens);
  }

  if (grantType === "refresh_token") {
    return oauthError(
      "unsupported_grant_type",
      "Refresh tokens are not issued yet; request a new access token.",
    );
  }

  if (grantType === "urn:ietf:params:oauth:grant-type:jwt-bearer") {
    if (clientId && clientId !== OAUTH_CLIENT_ID) {
      return oauthError("invalid_client", "Unknown client.", 401);
    }
    const assertion =
      params.get("assertion") ?? params.get("identity_assertion") ?? "";
    if (!assertion) {
      return oauthError("invalid_request", "assertion is required.");
    }
    try {
      const tokens = await exchangeAssertionForTokens(
        assertion,
        clientId || OAUTH_CLIENT_ID,
      );
      return Response.json(tokens);
    } catch {
      return oauthError("invalid_grant", "Invalid or expired identity_assertion.");
    }
  }

  if (grantType === "urn:workos:agent-auth:grant-type:claim") {
    const claimToken = params.get("claim_token") ?? "";
    const row = getClaim(claimToken);
    if (!row) {
      return oauthError("invalid_grant", "Unknown or expired claim_token.");
    }
    if (!row.completed || !row.userId || !row.userEmail || !row.userName) {
      return oauthError(
        "authorization_pending",
        "Claim ceremony not completed yet.",
      );
    }

    const signed = await signIdentityAssertion({
      sub: row.userId,
      registrationType: row.registrationType,
      scopes: row.scopes,
      email: row.userEmail,
      name: row.userName,
    });
    const tokens = await issueTokens({
      userId: row.userId,
      email: row.userEmail,
      name: row.userName,
      clientId: clientId || OAUTH_CLIENT_ID,
      scope: row.scopes.join(" "),
    });
    return Response.json({ ...tokens, ...signed });
  }

  return oauthError("unsupported_grant_type", `Unsupported grant_type: ${grantType}`);
}
