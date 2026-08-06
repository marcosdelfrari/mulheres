import {
  claimVerificationUri,
  completeClaim,
  getClaim,
  signIdentityAssertion,
  updateClaimEmail,
} from "@/lib/agent-auth";
import { authenticateResourceOwner } from "@/lib/oauth";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    claim_token?: string;
    email?: string;
    password?: string;
    user_code?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { error: "invalid_request", error_description: "JSON body required." },
      { status: 400 },
    );
  }

  const claimToken = body.claim_token ?? "";
  const row = getClaim(claimToken);
  if (!row) {
    return Response.json(
      {
        error: "invalid_grant",
        error_description: "Unknown or expired claim_token.",
      },
      { status: 400 },
    );
  }

  if (body.email) {
    updateClaimEmail(claimToken, body.email);
  }

  if (body.password && (body.email || row.email)) {
    const email = (body.email ?? row.email)!;
    const user = await authenticateResourceOwner(email, body.password);
    if (!user) {
      return Response.json(
        {
          error: "invalid_grant",
          error_description: "Invalid email or password.",
        },
        { status: 400 },
      );
    }

    if (body.user_code && body.user_code !== row.userCode) {
      return Response.json(
        {
          error: "invalid_grant",
          error_description: "Invalid user_code.",
        },
        { status: 400 },
      );
    }

    completeClaim(claimToken, user);
    const signed = await signIdentityAssertion({
      sub: user.id,
      registrationType: row.registrationType,
      scopes: row.scopes,
      email: user.email,
      name: user.name,
    });

    return Response.json({
      registration_id: row.registrationId,
      registration_type: row.registrationType,
      status: "complete",
      ...signed,
      scopes: row.scopes,
    });
  }

  const updated = getClaim(claimToken)!;

  return Response.json({
    registration_id: updated.registrationId,
    registration_type: updated.registrationType,
    claim_url: absoluteUrl("/agent/identity/claim"),
    claim_token: claimToken,
    claim_token_expires: new Date(updated.expiresAt).toISOString(),
    post_claim_scopes: updated.scopes,
    claim: {
      user_code: updated.userCode,
      expires_in: Math.max(0, Math.floor((updated.expiresAt - Date.now()) / 1000)),
      verification_uri: claimVerificationUri(claimToken),
      interval: 5,
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const claimToken =
    url.searchParams.get("claim_token") ??
    url.searchParams.get("claim_attempt_token") ??
    "";
  const row = getClaim(claimToken);
  if (!row) {
    return Response.json(
      { error: "invalid_request", error_description: "Unknown claim." },
      { status: 404 },
    );
  }

  return Response.json({
    registration_id: row.registrationId,
    registration_type: row.registrationType,
    status: row.completed ? "complete" : "pending",
    claim_token_expires: new Date(row.expiresAt).toISOString(),
    email: row.email,
    verification_uri: claimVerificationUri(claimToken),
  });
}
