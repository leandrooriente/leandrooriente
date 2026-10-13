import { Parser } from "htmlparser2";

// Match Cloudflare's public URLs while keeping the generated HTML filenames.
export const cleanPageUrl = (pathname) => pathname
  .replace(/\/index\.html$/u, "/")
  .replace(/\.html$/u, "");

export function addNavigationPrefetch(html, pageUrl, pageUrls) {
  const baseUrl = new URL(pageUrl, "https://site.invalid");
  const currentPage = cleanPageUrl(baseUrl.pathname);
  const knownPages = new Set([...pageUrls].map(cleanPageUrl));
  const targets = new Map();
  let bodyEnd;
  let inertDepth = 0;
  let hasRules = false;

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "template" || name === "noscript") inertDepth++;
      if (inertDepth) return;
      if (name === "script" && (
        attributes.type === "speculationrules" || "data-navigation-prefetch" in attributes
      )) hasRules = true;
      if (name !== "a" || !attributes.href || "download" in attributes) return;

      const href = attributes.href.trim();
      // Only site-relative navigation links; external URLs stay untouched.
      if (!href || /^(?:#|[a-z][a-z\d+.-]*:|\/\/)/iu.test(href)) return;

      let target;
      try {
        target = new URL(href, baseUrl);
      } catch {
        return;
      }

      const path = cleanPageUrl(target.pathname);
      if (target.origin !== baseUrl.origin || target.search || path === currentPage) return;
      if (knownPages.has(path)) targets.set(path, path);
    },
    onclosetag(name, implied) {
      if (name === "template" || name === "noscript") inertDepth--;
      if (name === "body" && !implied) bodyEnd = parser.startIndex;
    }
  });
  parser.end(html);

  if (bodyEnd === undefined || hasRules || !targets.size) return html;

  // Document prefetch uses a navigation cache, independent of HTML's HTTP cache.
  // Keep rules inactive until the current page has loaded and the browser is idle.
  const rules = JSON.stringify({
    prefetch: [{ source: "list", urls: [...targets.values()], eagerness: "immediate" }]
  }).replace(/</gu, "\\u003c");
  const block = `  <script data-navigation-prefetch>
      (() => {
        if (!HTMLScriptElement.supports?.("speculationrules")) return;

        const startPrefetch = () => {
          const rules = document.createElement("script");
          rules.type = "speculationrules";
          rules.textContent = JSON.stringify(${rules});
          document.body.append(rules);
        };
        const schedulePrefetch = () => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(startPrefetch);
          } else {
            window.setTimeout(startPrefetch, 0);
          }
        };

        if (document.readyState === "complete") {
          schedulePrefetch();
        } else {
          window.addEventListener("load", schedulePrefetch, { once: true });
        }
      })();
    </script>
  `;
  return html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
}
