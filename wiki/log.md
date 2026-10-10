# Wiki Operation Log

Chronological audit trail of all knowledge base operations (`[INGEST]`, `[QUERY]`, `[LINT]`).

---

## 2026-10-10

### [INGEST] Initial Comprehensive Ingestion
- **Sources Ingested**:
  - `raw/todo-requirements.md`
  - `raw/kindle-hardware-and-browser-specs.md`
  - `raw/twitter-api-landscape-and-nitter-history.md`
  - `raw/live-api-probes-and-cors-verification.md`
  - `raw/e-ink-ui-ux-design-patterns.md`
  - `raw/server-vs-serverless-tradeoffs.md`
- **Entity Pages Created**:
  - `wiki/kindle-browser-runtime.md`
  - `wiki/e-ink-refresh-mechanics.md`
  - `wiki/zero-scroll-deck-pagination.md`
  - `wiki/e-ink-typography-and-contrast.md`
  - `wiki/twitter-syndication-protocol.md`
  - `wiki/fxtwitter-v2-api.md`
  - `wiki/nitter-architecture-analysis.md`
  - `wiki/cors-and-browser-security.md`
  - `wiki/client-only-static-architecture.md`
  - `wiki/cloudflare-worker-serverless-architecture.md`
  - `wiki/local-lan-companion-architecture.md`
  - `wiki/authenticated-timeline-scraping.md`
  - `wiki/e-ink-image-dithering.md`
  - `wiki/keyboard-and-touch-navigation.md`
  - `wiki/architectural-decision-matrix.md`
  - `wiki/implementation-roadmap.md`
- **Key Findings Synthesized**:
  - Kindle firmware >= 5.16.4 provides a modern Chromium engine, but retains strict memory caps (<150MB) and e-ink refresh latency.
  - Full-page navigation causes full-screen inversion flashing; in-place DOM card updates trigger clean partial refreshes.
  - Twitter Syndication endpoints (`cdn.syndication.twimg.com`) block third-party origins via CORS (`access-control-allow-origin: https://platform.twitter.com`).
  - FxTwitter v2 API (`https://api.fxtwitter.com/2/profile/:handle/statuses`) is verified live via cURL to support `access-control-allow-origin: *`, returning full tweet content, metadata, and cursor pagination.
  - Dual-track solution designed: Track 1 (pure client-side static app requiring zero external servers) + Track 2 (lightweight local LAN companion script for older Kindles and authenticated feeds).
- **Contradictions Flagged**:
  - `wiki/client-only-static-architecture.md` vs `wiki/local-lan-companion-architecture.md` regarding personalized vs public timeline access and TLS root certificate compatibility on pre-5.16 devices.

### [INGEST] Core Implementation Assembled and Verified
- **Files Created**:
  - `src/index.html`: High-contrast, zero-scroll e-ink deck web reader with tap zones (30% left / 70% right), Oasis physical button listeners, clean screen ghosting flush, and cursor prefetching.
  - `companion.py`: Single-file Python companion server that serves `src/index.html` over unencrypted HTTP (port 8000) with local proxy fallback for older Kindles.
- **Verification Performed**:
  - Live server started on `http://localhost:8000`.
  - HTTP 200 verified for `src/index.html`.
  - HTTP 200 verified for live API proxy `http://localhost:8000/api/profile/karpathy` returning 20 real tweets.
  - Automatic detection implemented in `src/index.html` to work seamlessly either as a zero-server static web app (via `api.fxtwitter.com`) or through the local companion server.

### [INGEST] Option 1 (Zero-Server Static Reader) Polished and Verified in Chrome
- **Enhancements to `src/index.html`**:
  - Note-tweet auto-chunking: Long posts (> 750 characters) are automatically sliced into `Part 1/2`, `Part 2/2` sub-pages so content never overflows or requires scrolling.
  - Formatted metrics: Compact readable text (e.g., `11.8k Likes · 542 Reposts · 754 Replies`).
  - Saved Favorites: Added `localStorage`-backed favorites management with `[★]` toggle in top bar and quick chips in the menu.
  - Natural vertical spacing for quoted tweets and media toggles.
- **Chrome DevTools Protocol (CDP) Empirical Testing**:
  - Opened `file:///home/avreymi/code/x-kindel-interface/src/index.html` directly in headless Chrome (port 9222).
  - Verified live client-side fetching from `https://api.fxtwitter.com/2/profile/karpathy/statuses` (20 tweets loaded, zero server running).
  - Verified next/prev card flips via touch zones and keyboard event listeners.
  - Captured Kindle Paperwhite layout screenshots (`kindle_preview_updated.png`).
  - Created root `README.md` with zero-server GitHub Pages setup guide.
