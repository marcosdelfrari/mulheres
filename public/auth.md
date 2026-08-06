# auth.md

You are an agent. **Mulheres** supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation. Follow the steps in order; do not skip ahead.

Service hosts:

- Resource API: `https://mulheresdeluxo.com.br/api`
- Authorization server: `https://mulheresdeluxo.com.br`
- This skill: `https://mulheresdeluxo.com.br/auth.md`

## Step 1 — Discover

### 1a. Protected Resource Metadata

```http
GET /.well-known/oauth-protected-resource
```

```json
{
  "resource": "https://mulheresdeluxo.com.br/api",
  "resource_name": "Mulheres API",
  "authorization_servers": ["https://mulheresdeluxo.com.br"],
  "scopes_supported": ["openid", "profile", "email", "offline_access"],
  "bearer_methods_supported": ["header"]
}
```

A `401` from protected APIs includes:

```http
WWW-Authenticate: Bearer resource_metadata="https://mulheresdeluxo.com.br/.well-known/oauth-protected-resource"
```

### 1b. Authorization Server metadata

```http
GET /.well-known/oauth-authorization-server
```

Read `issuer`, `token_endpoint`, `jwks_uri`, and the `agent_auth` block (`skill`, `register_uri`, `claim_uri`, identity types, credential types).

Also available:

```http
GET /.well-known/openid-configuration
```

## Step 2 — Pick a method

1. **Anonymous** — register without a user identity for limited API access, then claim later.
2. **Verified email / service_auth** — start a claim ceremony with a login hint (email). The human completes verification at the claim URL.
3. **Identity assertion (ID-JAG)** — if your agent provider can mint an audience-bound ID-JAG for `https://mulheresdeluxo.com.br/api`, POST it as `identity_assertion`.
4. **Classic OAuth** — authorization code (+ PKCE) or resource-owner password at `/oauth/token` for interactive or trusted agents.

## Step 3 — Register

```http
POST /agent/identity
Content-Type: application/json
```

Examples:

```json
{ "type": "anonymous" }
```

```json
{ "type": "service_auth", "login_hint": "user@example.com" }
```

```json
{
  "type": "identity_assertion",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<ID-JAG JWT>"
}
```

Successful responses include a service-signed `identity_assertion` and, when needed, a `claim_token` / claim ceremony payload.

`register_uri` for discovery: `https://mulheresdeluxo.com.br/agent/identity`

## Step 4 — Claim (when required)

```http
POST /agent/identity/claim
Content-Type: application/json

{ "claim_token": "...", "email": "user@example.com" }
```

The response includes `user_code` and `verification_uri` for the human to open. Complete the ceremony at that URI, then poll the token endpoint with the claim grant when supported.

Claim URI: `https://mulheresdeluxo.com.br/agent/identity/claim`

## Step 5 — Exchange for an access_token

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

Supported grants include:

- `authorization_code`
- `password` (username = email)
- `client_credentials`
- `urn:ietf:params:oauth:grant-type:jwt-bearer` (exchange `identity_assertion`)
- `urn:workos:agent-auth:grant-type:claim` (poll claim ceremony)

## Step 6 — Call the API

```http
Authorization: Bearer <access_token>
```

Useful endpoints: `/api/health`, `/api/listings`, `/api/auth/me`, `/openapi.json`, `/.well-known/api-catalog`.

## Step 7 — Revocation

```http
POST /oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=<access_token>
```

Revocation URI: `https://mulheresdeluxo.com.br/oauth/revoke`

Providers may also push Security Event Tokens to `https://mulheresdeluxo.com.br/agent/event/notify` for assertion revocation events.

## Human documentation

- How the product works: https://mulheresdeluxo.com.br/guias/como-funciona
- Contact: https://mulheresdeluxo.com.br/contato
- LLM summary: https://mulheresdeluxo.com.br/llms.txt
