import { randomBytes, randomInt } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { absoluteUrl } from "@/lib/seo";
import {
  OAUTH_CLIENT_ID,
  getPrivateKey,
  getPublicKey,
  issueTokens,
  oauthIssuer,
  oauthKid,
} from "@/lib/oauth";

const ASSERTION_TTL_SEC = 60 * 60;
const CLAIM_TTL_MS = 10 * 60 * 1000;

export type ClaimRecord = {
  claimToken: string;
  registrationId: string;
  registrationType: string;
  userCode: string;
  email: string | null;
  scopes: string[];
  expiresAt: number;
  completed: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
};

const globalStore = globalThis as typeof globalThis & {
  __agentClaims?: Map<string, ClaimRecord>;
};

function claims() {
  if (!globalStore.__agentClaims) {
    globalStore.__agentClaims = new Map();
  }
  return globalStore.__agentClaims;
}

export function resourceAudience() {
  return absoluteUrl("/api");
}

export function createRegistrationId() {
  return `reg_${randomBytes(12).toString("base64url")}`;
}

export function createClaimToken() {
  return `clm_${randomBytes(18).toString("base64url")}`;
}

function createUserCode() {
  return String(randomInt(100000, 999999));
}

export async function signIdentityAssertion(input: {
  sub: string;
  registrationType: string;
  scopes: string[];
  email?: string | null;
  name?: string | null;
}) {
  const privateKey = await getPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ASSERTION_TTL_SEC;

  const assertion = await new SignJWT({
    sub: input.sub,
    registration_type: input.registrationType,
    scope: input.scopes.join(" "),
    email: input.email ?? undefined,
    name: input.name ?? undefined,
    token_use: "identity_assertion",
    client_id: OAUTH_CLIENT_ID,
  })
    .setProtectedHeader({ alg: "RS256", kid: oauthKid(), typ: "JWT" })
    .setIssuer(oauthIssuer())
    .setAudience(resourceAudience())
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(privateKey);

  return {
    identity_assertion: assertion,
    assertion_expires: new Date(exp * 1000).toISOString(),
  };
}

export async function verifyIdentityAssertion(assertion: string) {
  const publicKey = await getPublicKey();
  const { payload } = await jwtVerify(assertion, publicKey, {
    issuer: oauthIssuer(),
    audience: resourceAudience(),
  });
  if (payload.token_use !== "identity_assertion") {
    throw new Error("not_identity_assertion");
  }
  return payload;
}

export function createClaimCeremony(input: {
  registrationId: string;
  registrationType: string;
  scopes: string[];
  email?: string | null;
}) {
  const claimToken = createClaimToken();
  const userCode = createUserCode();
  const expiresAt = Date.now() + CLAIM_TTL_MS;

  claims().set(claimToken, {
    claimToken,
    registrationId: input.registrationId,
    registrationType: input.registrationType,
    userCode,
    email: input.email?.toLowerCase() ?? null,
    scopes: input.scopes,
    expiresAt,
    completed: false,
    userId: null,
    userEmail: null,
    userName: null,
  });

  const claimAttempt = encodeURIComponent(claimToken);
  const verificationUri = absoluteUrl(
    `/login?return_to=${encodeURIComponent(`/agent/claim?claim_attempt_token=${claimAttempt}`)}`,
  );

  return {
    claim_url: absoluteUrl("/agent/identity/claim"),
    claim_token: claimToken,
    claim_token_expires: new Date(expiresAt).toISOString(),
    post_claim_scopes: input.scopes,
    claim: {
      user_code: userCode,
      expires_in: Math.floor(CLAIM_TTL_MS / 1000),
      verification_uri: verificationUri,
      interval: 5,
    },
  };
}

export function getClaim(claimToken: string) {
  const row = claims().get(claimToken);
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    claims().delete(claimToken);
    return null;
  }
  return row;
}

export function updateClaimEmail(claimToken: string, email: string) {
  const row = getClaim(claimToken);
  if (!row) return null;
  row.email = email.toLowerCase();
  claims().set(claimToken, row);
  return row;
}

export function completeClaim(
  claimToken: string,
  user: { id: string; email: string; name: string },
) {
  const row = getClaim(claimToken);
  if (!row) return null;
  row.completed = true;
  row.userId = user.id;
  row.userEmail = user.email;
  row.userName = user.name;
  claims().set(claimToken, row);
  return row;
}

export function claimVerificationUri(claimToken: string) {
  return absoluteUrl(
    `/login?return_to=${encodeURIComponent(`/agent/claim?claim_attempt_token=${encodeURIComponent(claimToken)}`)}`,
  );
}

export async function exchangeAssertionForTokens(
  assertion: string,
  clientId: string,
) {
  const payload = await verifyIdentityAssertion(assertion);
  const sub = String(payload.sub ?? "");
  const email =
    typeof payload.email === "string"
      ? payload.email
      : `${sub}@agents.local`;
  const name =
    typeof payload.name === "string" ? payload.name : "Agent registration";
  const scope =
    typeof payload.scope === "string"
      ? payload.scope
      : "openid profile email";

  return issueTokens({
    userId: sub,
    email,
    name,
    clientId,
    scope,
  });
}
