# Architectural Decision Matrix

## Summary
The Architectural Decision Matrix evaluates the proposed architectural solutions against the core constraints defined in `TODO.md`: avoidance of external running servers, zero-scroll e-ink ergonomics, minimal screen refreshes, and long-term simplicity.

## Details

### Comparison Matrix

| Evaluation Dimension | Architecture A: Pure Client-Side Static | Architecture B: Cloudflare Worker Edge | Architecture C: Local LAN Companion |
| :--- | :--- | :--- | :--- |
| **Server Requirement** | **Zero server** (100% static) | **Zero running server** (serverless on-demand) | **Zero cloud server** (local script on LAN) |
| **External Hosting Cost** | $0 (GitHub / CF Pages) | $0 (Cloudflare Free Tier) | $0 (local computer) |
| **Personal Timeline ("Following")** | ❌ Public profiles only | ❌ Public profiles only (unless passing cookie) | ✅ Full authenticated access |
| **E-Ink Screen Flashes** | ✅ Zero (in-place DOM updates) | ✅ Zero (in-place DOM or SSR) | ✅ Zero (in-place DOM updates) |
| **Universal Kindle Support** | ⚠️ Requires modern TLS (>= 5.16) | ⚠️ Requires modern TLS (>= 5.16) | ✅ 100% of Kindles (HTTP over LAN) |
| **Setup Friction** | **Lowest** (open URL & bookmark) | **Medium** (1-time `wrangler deploy`) | **Low** (run single python command) |
| **Resilience to X Takedowns** | Moderate (relies on FxTwitter API) | High (can rotate fallback upstreams) | High (direct user session scraping) |

### Recommended Synthesis Strategy: The Dual-Track Path

To give the user the best possible experience aligned with their exact request:
1. **Track 1 (Default / Immediate): Pure Client-Side Static Reader (Zero Server)**
   - Delivers on the primary desire to avoid running any server.
   - Built as a single self-contained HTML/CSS/JS file.
   - Uses `api.fxtwitter.com/2/profile/:handle/statuses` to read any public Twitter user or curated lists of handles.
   - Embeds [[zero-scroll-deck-pagination]], high-contrast typography, and tap/key navigation.
   - Can be hosted on GitHub Pages or opened directly.

2. **Track 2 (Personalized / Universal): Local Companion Script**
   - For users wanting to read their actual private "Following" feed or users with older Kindles that fail HTTPS handshakes.
   - A single, dependency-light Python script (`uv run kindle_companion.py`) that serves the exact same frontend over local HTTP and connects via Twitter session cookies.

This dual-track approach guarantees that the codebase is completely self-contained, clean, simple, and extensible.

## Related
- [[client-only-static-architecture]]
- [[cloudflare-worker-serverless-architecture]]
- [[local-lan-companion-architecture]]
- [[implementation-roadmap]]

## Sources
- raw/todo-requirements.md
- raw/server-vs-serverless-tradeoffs.md
