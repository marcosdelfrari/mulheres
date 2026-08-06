# auth.md

Você é um agente. O **Mulheres** oferece **registro agentic**: descobrir → registrar → (reivindicar se necessário) → trocar por um access_token → chamar a API → tratar revogação. Siga as etapas em ordem; não pule à frente.

Hosts do serviço:

- Resource API: `https://mulheresdeluxo.com.br/api`
- Authorization server: `https://mulheresdeluxo.com.br`
- Esta skill: `https://mulheresdeluxo.com.br/auth.md`

## Etapa 1 — Descobrir

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

Um `401` de APIs protegidas inclui:

```http
WWW-Authenticate: Bearer resource_metadata="https://mulheresdeluxo.com.br/.well-known/oauth-protected-resource"
```

### 1b. Metadados do Authorization Server

```http
GET /.well-known/oauth-authorization-server
```

Leia `issuer`, `token_endpoint`, `jwks_uri` e o bloco `agent_auth` (`skill`, `register_uri`, `claim_uri`, tipos de identidade, tipos de credencial).

Também disponível:

```http
GET /.well-known/openid-configuration
```

## Etapa 2 — Escolher um método

1. **Anonymous** — registre sem identidade de usuário para acesso limitado à API e reivindique depois.
2. **Verified email / service_auth** — inicie uma cerimônia de claim com login hint (e-mail). O humano conclui a verificação na URL de claim.
3. **Identity assertion (ID-JAG)** — se o provedor do agente puder emitir um ID-JAG bound à audience `https://mulheresdeluxo.com.br/api`, envie-o como `identity_assertion`.
4. **OAuth clássico** — authorization code (+ PKCE) ou resource-owner password em `/oauth/token` para agentes interativos ou confiáveis.

## Etapa 3 — Registrar

```http
POST /agent/identity
Content-Type: application/json
```

Exemplos:

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

Respostas bem-sucedidas incluem um `identity_assertion` assinado pelo serviço e, quando necessário, um `claim_token` / payload da cerimônia de claim.

`register_uri` para descoberta: `https://mulheresdeluxo.com.br/agent/identity`

## Etapa 4 — Claim (quando necessário)

```http
POST /agent/identity/claim
Content-Type: application/json

{ "claim_token": "...", "email": "user@example.com" }
```

A resposta inclui `user_code` e `verification_uri` para o humano abrir. Conclua a cerimônia nessa URI e, em seguida, faça poll no token endpoint com o claim grant quando suportado.

Claim URI: `https://mulheresdeluxo.com.br/agent/identity/claim`

## Etapa 5 — Trocar por um access_token

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

Grants suportados incluem:

- `authorization_code`
- `password` (username = e-mail)
- `client_credentials`
- `urn:ietf:params:oauth:grant-type:jwt-bearer` (troca de `identity_assertion`)
- `urn:workos:agent-auth:grant-type:claim` (poll da cerimônia de claim)

## Etapa 6 — Chamar a API

```http
Authorization: Bearer <access_token>
```

Endpoints úteis: `/api/health`, `/api/listings`, `/api/auth/me`, `/openapi.json`, `/.well-known/api-catalog`.

## Etapa 7 — Revogação

```http
POST /oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=<access_token>
```

Revocation URI: `https://mulheresdeluxo.com.br/oauth/revoke`

Provedores também podem enviar Security Event Tokens para `https://mulheresdeluxo.com.br/agent/event/notify` em eventos de revogação de assertion.

## Documentação humana

- Como o produto funciona: https://mulheresdeluxo.com.br/guias/como-funciona
- Contato: https://mulheresdeluxo.com.br/contato
- Resumo para LLMs: https://mulheresdeluxo.com.br/llms.txt
