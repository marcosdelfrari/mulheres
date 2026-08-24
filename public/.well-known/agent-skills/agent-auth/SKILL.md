---
name: agent-auth
description: Registre e autentique agentes no Mulheres de Luxo com Auth.md — descubra metadados PRM/AS, registre em /agent/identity, reivindique se preciso, troque por access_token e revogue. Use ao chamar APIs protegidas como agente.
---

# Auth de agentes (Auth.md)

Siga `/auth.md` de ponta a ponta. Não pule a descoberta.

## Descobrir

```http
GET /.well-known/oauth-protected-resource
GET /.well-known/oauth-authorization-server
```

Leia `agent_auth` para `skill`, `register_uri`, `claim_uri`, tipos de identidade e tipos de credencial.

## Registrar

```http
POST /agent/identity
Content-Type: application/json

{ "type": "anonymous" }
```

Outros tipos: `service_auth` (com `login_hint` de e-mail), `identity_assertion` (ID-JAG / verified_email).

## Claim (quando necessário)

```http
POST /agent/identity/claim
Content-Type: application/json

{ "claim_token": "...", "email": "user@example.com" }
```

Conclua a cerimônia humana em `claim.verification_uri`, ou finalize com e-mail + senha quando suportado.

## Token

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

Grants incluem `authorization_code`, `password`, `client_credentials`, `urn:ietf:params:oauth:grant-type:jwt-bearer` e `urn:workos:agent-auth:grant-type:claim`.

## Chamar API / revogar

```http
Authorization: Bearer <access_token>
POST /oauth/revoke
```

Instruções completas: `/auth.md`.
