import assert from "node:assert/strict";
import {
  estimateTokens,
  htmlToAgentMarkdown,
  prefersMarkdown,
} from "../lib/markdown-negotiation";

assert.equal(prefersMarkdown("text/markdown"), true);
assert.equal(prefersMarkdown("text/markdown, text/html;q=0.9"), true);
assert.equal(prefersMarkdown("text/html,application/xhtml+xml"), false);
assert.equal(prefersMarkdown(null), false);

const sample = `<!doctype html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="Hello agents" />
  <meta property="og:image" content="https://example.com/cover.png" />
  <script type="application/ld+json">{"@type":"WebPage","name":"Test"}</script>
</head>
<body>
  <header><nav>Menu</nav></header>
  <main><h1>Welcome</h1><p>Body <strong>text</strong>.</p></main>
  <footer>Footer</footer>
</body>
</html>`;

const md = htmlToAgentMarkdown(sample);
assert.match(md, /^---\n/);
assert.match(md, /title: Test Page/);
assert.match(md, /description: Hello agents/);
assert.match(md, /# Welcome/);
assert.match(md, /```json/);
assert.ok(estimateTokens(md) > 0);
assert.ok(!md.includes("Menu"));
assert.ok(!md.includes("Footer"));

console.log("markdown-negotiation ok");
