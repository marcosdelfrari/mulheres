#!/usr/bin/env node
/**
 * Prints DNS-AID records for mulheresdeluxo.com.br in a form suitable for
 * Registro.br / BIND / Cloudflare zone editors.
 *
 * DNS-AID cannot be published from the Next.js app — these records must
 * exist at the authoritative DNS (currently a.auto.dns.br / b.auto.dns.br).
 *
 * Usage: node scripts/print-dnsaid-records.mjs
 */

const DOMAIN = process.env.DNS_AID_DOMAIN ?? "mulheresdeluxo.com.br";

const records = [
  {
    name: `_index._agents.${DOMAIN}`,
    type: "HTTPS",
    ttl: 3600,
    rdata: `1 ${DOMAIN}. alpn="h2,h3" port=443 mandatory=alpn,port key65280="/.well-known/agents"`,
  },
  {
    name: `_index._agents.${DOMAIN}`,
    type: "SVCB",
    ttl: 3600,
    rdata: `1 ${DOMAIN}. alpn="h2,h3" port=443 mandatory=alpn,port key65280="/.well-known/agents"`,
  },
  {
    name: `_https._agents.${DOMAIN}`,
    type: "HTTPS",
    ttl: 3600,
    rdata: `1 ${DOMAIN}. alpn="h2,h3" port=443 mandatory=alpn,port key65280="agent-card.json" key65281="https://${DOMAIN}/.well-known/agent-card.json"`,
  },
  {
    name: `_a2a._agents.${DOMAIN}`,
    type: "SVCB",
    ttl: 3600,
    rdata: `1 ${DOMAIN}. alpn="a2a,h2" port=443 mandatory=alpn,port key65280="agent-card.json" key65281="https://${DOMAIN}/.well-known/agent-card.json"`,
  },
  {
    name: `mulheres-web._agents.${DOMAIN}`,
    type: "SVCB",
    ttl: 3600,
    rdata: `0 ${DOMAIN}.`,
  },
];

console.log(`# DNS-AID records for ${DOMAIN}`);
console.log("# Enable DNSSEC on the zone after publishing.\n");

for (const rr of records) {
  console.log(`${rr.name}. ${rr.ttl} IN ${rr.type} ${rr.rdata}`);
}

console.log(`
# Validate (DoH):
# curl -s "https://cloudflare-dns.com/dns-query?name=_index._agents.${DOMAIN}&type=HTTPS" -H "accept: application/dns-json"
# curl -s "https://cloudflare-dns.com/dns-query?name=_a2a._agents.${DOMAIN}&type=SVCB" -H "accept: application/dns-json"
`);
