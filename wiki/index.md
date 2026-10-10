# Wiki Index

Master directory of the `x-kindel-interface` LLM Knowledge Base, categorized by domain.

---

## 1. Kindle Display & Hardware Runtime
- [[kindle-browser-runtime]] — Evolution of the browser engine from legacy WebKit (< 5.16.4) to Chromium (5.16.4+), memory caps, and TLS limits.
- [[e-ink-refresh-mechanics]] — Physical behavior of electrophoretic microcapsules: global inversion flash vs partial refresh.
- [[e-ink-typography-and-contrast]] — Typography rules, 300 PPI Bookerly fonts, solid borders, and avoiding washed-out gray tones.
- [[e-ink-image-dithering]] — Floyd-Steinberg dithering, contrast quantization, and on-demand media loading for low-RAM e-readers.
- [[keyboard-and-touch-navigation]] — Ergonomic tap zones (30% left / 70% right), Oasis physical button keybindings, and zero-delay touches.

---

## 2. Twitter / X Data Access Protocols
- [[twitter-syndication-protocol]] — Analysis of `cdn.syndication.twimg.com` and `syndication.twitter.com`, CORS blocking, and token protections.
- [[fxtwitter-v2-api]] — Full specification of the public, unauthenticated FxTwitter REST API (`/2/profile/:handle/statuses`), CORS headers, and cursor pagination.
- [[nitter-architecture-analysis]] — Architectural review of Nitter, SSR benefits, demise from guest token deprecation and legal actions in August 2026.
- [[authenticated-timeline-scraping]] — Using session cookies (`auth_token`/`ct0`) with Twitter GraphQL to read personalized "Following" timelines.
- [[cors-and-browser-security]] — Browser cross-origin security models and techniques for overcoming them on Kindle.

---

## 3. Interaction & Frontend Engine
- [[zero-scroll-deck-pagination]] — The core deck card UI pattern: discrete page-by-page tweet reading with in-place DOM updates and zero scroll stutter.

---

## 4. Architecture & Deployment Models
- [[client-only-static-architecture]] — Zero-server static model: single HTML file fetching directly from CORS edge APIs.
- [[cloudflare-worker-serverless-architecture]] — On-demand serverless edge proxy: caching, CORS normalization, and server-side rendering without a persistent server.
- [[local-lan-companion-architecture]] — Local-first Python micro-daemon: serves unencrypted HTTP over LAN to bypass Kindle SSL expiration and access personalized feeds.
- [[architectural-decision-matrix]] — Comparative evaluation of all deployment topologies against user preferences.
- [[implementation-roadmap]] — Concrete phased execution plan from research prototype to production Kindle reader.
