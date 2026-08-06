import {
  createClaimCeremony,
  createRegistrationId,
  signIdentityAssertion,
} from "@/lib/agent-auth";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

const PRE_CLAIM_SCOPES = ["openid"];
const FULL_SCOPES = ["openid", "profile", "email", "offline_access"];

export async function POST(request: Request) {
  let body: {
    type?: string;
    assertion_type?: string;
    assertion?: string;
    login_hint?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { error: "invalid_request", error_description: "JSON body required." },
      { status: 400 },
    );
  }

  const type = body.type ?? "";

  if (type === "anonymous") {
    const registrationId = createRegistrationId();
    const signed = await signIdentityAssertion({
      sub: registrationId,
      registrationType: "anonymous",
      scopes: PRE_CLAIM_SCOPES,
    });
    const claim = createClaimCeremony({
      registrationId,
      registrationType: "anonymous",
      scopes: FULL_SCOPES,
    });

    return Response.json({
      registration_id: registrationId,
      registration_type: "anonymous",
      ...signed,
      pre_claim_scopes: PRE_CLAIM_SCOPES,
      ...claim,
    });
  }

  if (type === "service_auth") {
    const loginHint = body.login_hint?.trim().toLowerCase();
    if (!loginHint) {
      return Response.json(
        {
          error: "invalid_request",
          error_description: "login_hint (email) is required for service_auth.",
        },
        { status: 400 },
      );
    }

    const registrationId = createRegistrationId();
    const claim = createClaimCeremony({
      registrationId,
      registrationType: "service_auth",
      scopes: FULL_SCOPES,
      email: loginHint,
    });

    return Response.json({
      registration_id: registrationId,
      registration_type: "service_auth",
      ...claim,
    });
  }

  if (type === "identity_assertion") {
    const assertionType = body.assertion_type ?? "";
    const supported = [
      "verified_email",
      "urn:ietf:params:oauth:token-type:id-jag",
    ];
    if (!supported.includes(assertionType)) {
      return Response.json(
        {
          error: "unsupported_assertion_type",
          error_description: `Supported: ${supported.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ID-JAG / verified_email from external providers require a trust list.
    // Until providers are onboarded, start a claim ceremony instead of rejecting.
    const registrationId = createRegistrationId();
    const claim = createClaimCeremony({
      registrationId,
      registrationType: "identity_assertion",
      scopes: FULL_SCOPES,
      email: body.login_hint ?? null,
    });

    return Response.json(
      {
        error: "interaction_required",
        error_description:
          "Confirm linking at the claim ceremony, or use anonymous / service_auth registration.",
        registration_id: registrationId,
        registration_type: "identity_assertion",
        ...claim,
        skill: absoluteUrl("/auth.md"),
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'AgentAuth error="interaction_required", error_description="Claim ceremony required"',
        },
      },
    );
  }

  return Response.json(
    {
      error: "unsupported_identity_type",
      error_description:
        "Supported types: anonymous, service_auth, identity_assertion. See /auth.md.",
    },
    { status: 400 },
  );
}

export async function GET() {
  return Response.json({
    skill: absoluteUrl("/auth.md"),
    register_uri: absoluteUrl("/agent/identity"),
    identity_types_supported: [
      "anonymous",
      "identity_assertion",
      "service_auth",
    ],
    documentation: absoluteUrl("/auth.md"),
  });
}
