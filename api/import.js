// Vercel serverless function: GET /api/import?url=https://...
// Fetches a coffee product page on the server (browsers can't, because of CORS)
// and returns its readable text so the app can pick out Origin / Variety / Process.

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 9000;

function blockedHost(host) {
  host = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  return host.includes(":"); // raw IPv6 literals
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", deg: "°", eacute: "é", iacute: "í", aacute: "á", oacute: "ó", uacute: "ú", ntilde: "ñ" };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENT[e.toLowerCase()] ?? m;
});

function htmlToText(html) {
  let s = html
    .replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|section|article|tr|table|dt|dd|dl|header|footer|main|nav|aside|form|figure|figcaption|blockquote|button|option)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  s = decode(s);
  return s.split("\n").map(l => l.replace(/[ \t ]+/g, " ").trim()).filter((l, i, a) => l || (a[i - 1] && a[i - 1].trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  let target;
  try { target = new URL(String((req.query && req.query.url) || "")); } catch { res.statusCode = 400; return res.end(JSON.stringify({ error: "bad_url" })); }
  if (target.protocol !== "https:" || blockedHost(target.hostname)) { res.statusCode = 400; return res.end(JSON.stringify({ error: "bad_url" })); }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(target.href, {
      redirect: "follow", signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; OrigamiBrewLog/1.0; +https://vercel.com)", accept: "text/html,application/xhtml+xml" },
    });
    const finalUrl = new URL(r.url || target.href);
    if (finalUrl.protocol !== "https:" || blockedHost(finalUrl.hostname)) throw new Error("bad_redirect");
    if (!r.ok) { res.statusCode = 502; return res.end(JSON.stringify({ error: "upstream_" + r.status })); }
    const type = r.headers.get("content-type") || "";
    if (!/html|text/i.test(type)) { res.statusCode = 415; return res.end(JSON.stringify({ error: "not_html" })); }
    const buf = Buffer.from(await r.arrayBuffer());
    const html = buf.subarray(0, MAX_BYTES).toString("utf8");
    const title = decode(((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim());
    const text = (title ? "Title: " + title + "\n" : "") + htmlToText(html);
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(JSON.stringify({ url: finalUrl.href, title, text: text.slice(0, 60000) }));
  } catch (e) {
    res.statusCode = e && e.name === "AbortError" ? 504 : 502;
    res.end(JSON.stringify({ error: e && e.name === "AbortError" ? "timeout" : "fetch_failed" }));
  } finally { clearTimeout(timer); }
};

module.exports.htmlToText = htmlToText;
