---
name: agent-auth
description: Register and authenticate agents against Mulheres using Auth.md — discover PRM/AS metadata, register at /agent/identity, claim if needed, exchange for an access_token, and revoke. Use when calling protected APIs as an agent.
---

# Agent auth (Auth.md)

Follow `/auth.md` end-to-end. Do not skip discovery.

## Discover

```http
GET /.well-known/oauth-protected-resource
GET /.well-known/oauth-authorization-server
```

Read `agent_auth` for `skill`, `register_uri`, `claim_uri`, identity types, and credential types.

## Register

```http
POST /agent/identity
Content-Type: application/json

{ "type": "anonymous" }
```

Other types: `service_auth` (with `login_hint` email), `identity_assertion` (ID-JAG / verified_email).

## Claim (when required)

```http
POST /agent/identity/claim
Content-Type: application/json

{ "claim_token": "...", "email": "user@example.com" }
```

Complete the human ceremony at `claim.verification_uri`, or finish with email + password when supported.

## Token

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

Grants include `authorization_code`, `password`, `client_credentials`, `urn:ietf:params:oauth:grant-type:jwt-bearer`, and `urn:workos:agent-auth:grant-type:claim`.

## Call API / revoke

```http
Authorization: Bearer <access_token>
POST /oauth/revoke
```

Full instructions: `/auth.md`.
