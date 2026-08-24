import { createHash, randomBytes, timingSafeEqual } from "crypto";
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  SignJWT,
  jwtVerify,
  type JWK,
} from "jose";
import publicJwk from "@/lib/oauth-public-jwk.json";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { hashToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const OAUTH_CLIENT_ID =
  process.env.OAUTH_CLIENT_ID ?? "mulheres-agent";
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET ?? "";

const ACCESS_TOKEN_TTL_SEC = 60 * 60;
const CODE_TTL_MS = 10 * 60 * 1000;

type CryptoKeyLike = CryptoKey | Uint8Array;

let privateKeyPromise: Promise<CryptoKeyLike> | null = null;
let runtimePublicJwk: JWK | null = null;

function issuer() {
  return absoluteUrl("/");
}

async function loadPrivateJwk(): Promise<JWK> {
  const raw = process.env.OAUTH_PRIVATE_JWK;
  if (raw) {
    return JSON.parse(raw) as JWK;
  }

  // Dev fallback: ephemeral key (tokens won't survive restarts).
  const { privateKey, publicKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  const priv = await exportJWK(privateKey);
  const pub = await exportJWK(publicKey);
  const kid = "mulheres-ephemeral";
  Object.assign(priv, { alg: "RS256", use: "sig", kid });
  Object.assign(pub, { alg: "RS256", use: "sig", kid });
  runtimePublicJwk = pub;
  return priv;
}

export async function getPrivateKey() {
  if (!privateKeyPromise) {
    privateKeyPromise = loadPrivateJwk().then(
      async (jwk) => (await importJWK(jwk, "RS256")) as CryptoKeyLike,
    );
  }
  return privateKeyPromise;
}

export async function getPublicKey() {
  // Ensure ephemeral keypair is generated before reading the public JWK.
  await getPrivateKey();
  return (await importJWK(
    (runtimePublicJwk ?? (publicJwk as JWK)) as JWK,
    "RS256",
  )) as CryptoKeyLike;
}

export function oauthIssuer() {
  return issuer().replace(/\/$/, "");
}

export function oauthKid() {
  return ((runtimePublicJwk ?? (publicJwk as JWK)) as JWK).kid ?? "mulheres-1";
}

export async function getJwks() {
  await getPrivateKey();
  const jwk = (runtimePublicJwk ?? (publicJwk as JWK)) as JWK;
  const { d: _d, p: _p, q: _q, dp: _dp, dq: _dq, qi: _qi, ...pub } = jwk as JWK &
    Record<string, unknown>;
  return { keys: [pub] };
}

export function buildOAuthAuthorizationServerMetadata() {
  const iss = issuer().replace(/\/$/, "");
  const prm = buildProtectedResourceMetadata();

  return {
    issuer: iss,
    authorization_endpoint: absoluteUrl("/oauth/authorize"),
    token_endpoint: absoluteUrl("/oauth/token"),
    revocation_endpoint: absoluteUrl("/oauth/revoke"),
    jwks_uri: absoluteUrl("/.well-known/jwks.json"),
    registration_endpoint: absoluteUrl("/oauth/register"),
    resource: prm.resource,
    authorization_servers: prm.authorization_servers,
    scopes_supported: prm.scopes_supported,
    bearer_methods_supported: prm.bearer_methods_supported,
    response_types_supported: ["code", "token"],
    response_modes_supported: ["query", "fragment"],
    grant_types_supported: [
      "authorization_code",
      "password",
      "refresh_token",
      "client_credentials",
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "urn:workos:agent-auth:grant-type:claim",
    ],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none",
    ],
    code_challenge_methods_supported: ["S256", "plain"],
    service_documentation: absoluteUrl("/guias/como-funciona"),
    ui_locales_supported: ["pt-BR", "en"],
    agent_auth: {
      skill: absoluteUrl("/auth.md"),
      register_uri: absoluteUrl("/agent/identity"),
      identity_endpoint: absoluteUrl("/agent/identity"),
      claim_uri: absoluteUrl("/agent/identity/claim"),
      claim_endpoint: absoluteUrl("/agent/identity/claim"),
      revocation_uri: absoluteUrl("/oauth/revoke"),
      events_endpoint: absoluteUrl("/agent/event/notify"),
      identity_types_supported: [
        "anonymous",
        "identity_assertion",
        "service_auth",
      ],
      identity_assertion: {
        assertion_types_supported: [
          "verified_email",
          "urn:ietf:params:oauth:token-type:id-jag",
        ],
        credential_types_supported: ["access_token", "identity_assertion"],
      },
      anonymous: {
        credential_types_supported: ["access_token", "identity_assertion"],
      },
      service_auth: {
        credential_types_supported: ["access_token", "identity_assertion"],
      },
      events_supported: [
        "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
      ],
    },
  };
}

export function buildOpenIdConfiguration() {
  const base = buildOAuthAuthorizationServerMetadata();
  return {
    ...base,
    userinfo_endpoint: absoluteUrl("/oauth/userinfo"),
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    claims_supported: [
      "sub",
      "iss",
      "aud",
      "exp",
      "iat",
      "email",
      "name",
      "preferred_username",
    ],
  };
}

export function buildProtectedResourceMetadata() {
  const iss = issuer().replace(/\/$/, "");
  return {
    resource: absoluteUrl("/api"),
    authorization_servers: [iss],
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    bearer_methods_supported: ["header"],
    resource_documentation: absoluteUrl("/guias/como-funciona"),
    resource_name: "Mulheres de Luxo API",
  };
}

export function wwwAuthenticateBearer(error?: string, description?: string) {
  const metadata = absoluteUrl("/.well-known/oauth-protected-resource");
  const parts = [
    `Bearer realm="mulheres"`,
    `resource_metadata="${metadata}"`,
  ];
  if (error) parts.push(`error="${error}"`);
  if (description) parts.push(`error_description="${description}"`);
  return parts.join(", ");
}

export function unauthorizedBearer(
  error = "invalid_token",
  description = "Autenticação necessária.",
) {
  return Response.json(
    { error, error_description: description },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": wwwAuthenticateBearer(error, description),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function createAuthorizationCodeValue() {
  return randomBytes(32).toString("base64url");
}

export async function storeAuthorizationCode(input: {
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
}) {
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: hashToken(input.code),
      userId: input.userId,
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      scope: input.scope,
      codeChallenge: input.codeChallenge ?? null,
      codeChallengeMethod: input.codeChallengeMethod ?? null,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
}

function verifyPkce(
  verifier: string | undefined,
  challenge: string | null | undefined,
  method: string | null | undefined,
) {
  if (!challenge) return true;
  if (!verifier) return false;
  if ((method ?? "plain") === "plain") {
    return verifier === challenge;
  }
  const digest = createHash("sha256").update(verifier).digest("base64url");
  return digest === challenge;
}

export async function consumeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier?: string;
}) {
  const row = await prisma.oAuthAuthorizationCode.findUnique({
    where: { codeHash: hashToken(input.code) },
    include: { user: true },
  });

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return null;
  }
  if (row.clientId !== input.clientId || row.redirectUri !== input.redirectUri) {
    return null;
  }
  if (!verifyPkce(input.codeVerifier, row.codeChallenge, row.codeChallengeMethod)) {
    return null;
  }

  await prisma.oAuthAuthorizationCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  return row;
}

export async function issueTokens(input: {
  userId: string;
  email: string;
  name: string;
  clientId: string;
  scope?: string;
}) {
  const scope = input.scope ?? "openid profile email";
  const privateKey = await getPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const iss = issuer().replace(/\/$/, "");
  const kid = ((runtimePublicJwk ?? (publicJwk as JWK)) as JWK).kid ?? "mulheres-1";

  const accessToken = await new SignJWT({
    sub: input.userId,
    email: input.email,
    name: input.name,
    scope,
    client_id: input.clientId,
    token_use: "access",
  })
    .setProtectedHeader({ alg: "RS256", kid, typ: "JWT" })
    .setIssuer(iss)
    .setAudience(iss)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SEC)
    .sign(privateKey);

  const idToken = await new SignJWT({
    sub: input.userId,
    email: input.email,
    name: input.name,
    preferred_username: input.email,
  })
    .setProtectedHeader({ alg: "RS256", kid, typ: "JWT" })
    .setIssuer(iss)
    .setAudience(input.clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SEC)
    .sign(privateKey);

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SEC,
    scope,
    id_token: idToken,
  };
}

export async function verifyAccessToken(token: string) {
  const publicKey = await getPublicKey();
  const iss = issuer().replace(/\/$/, "");
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: iss,
    audience: iss,
  });
  return payload;
}

export async function authenticateResourceOwner(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export function validateClient(
  clientId: string,
  clientSecret: string | null | undefined,
  authMethod: "none" | "secret" = "secret",
) {
  if (clientId !== OAUTH_CLIENT_ID) return false;
  if (authMethod === "none") return true;
  if (!OAUTH_CLIENT_SECRET) return false;
  const a = Buffer.from(clientSecret ?? "");
  const b = Buffer.from(OAUTH_CLIENT_SECRET);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return {
      clientId: decoded.slice(0, idx),
      clientSecret: decoded.slice(idx + 1),
    };
  } catch {
    return null;
  }
}

export { SITE_NAME };
