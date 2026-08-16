import type { NextConfig } from "next";

const AGENT_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
  '</guias/como-funciona>; rel="service-doc"; type="text/html"',
  '</api/health>; rel="status"; type="application/json"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</auth.md>; rel="describedby"; type="text/markdown"',
  '</.well-known/agent-card.json>; rel="alternate"; type="application/json"',
  '</.well-known/agents>; rel="index"; type="application/json"',
].join(", ");

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@vladmandic/face-api",
    "@tensorflow/tfjs",
    "nsfwjs",
    "sharp",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "mulheres-luxo-bucket.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/auth.md",
        headers: [
          {
            key: "Content-Type",
            value: "text/markdown; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
      {
        source: "/.well-known/agent-skills/:skill/SKILL.md",
        headers: [
          {
            key: "Content-Type",
            value: "text/markdown; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: AGENT_LINK_HEADER,
          },
          {
            key: "Vary",
            value: "Accept",
          },
          {
            key: "Content-Signal",
            value: "ai-train=no, search=yes, ai-input=yes",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value: "Accept",
          },
          {
            key: "Content-Signal",
            value: "ai-train=no, search=yes, ai-input=yes",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/catalogo",
        has: [{ type: "query", key: "search", value: "Belo Horizonte" }],
        destination: "/minas-gerais/belo-horizonte",
        permanent: true,
      },
      {
        source: "/catalogo",
        has: [{ type: "query", key: "search", value: "bh" }],
        destination: "/minas-gerais/belo-horizonte",
        permanent: true,
      },
      {
        source: "/guias/mulheres-vs-fatal-model",
        destination: "/guias/alternativas-em-bh",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
