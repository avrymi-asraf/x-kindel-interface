# Cloudflare Worker Serverless Architecture

## Summary
The Cloudflare Worker Serverless Architecture utilizes an on-demand edge compute function to act as an intelligent proxy between the Kindle browser and upstream Twitter data sources. It requires no persistent running server, operates within Cloudflare's free tier (100k requests/day), and enables server-side rendering (SSR) of e-ink HTML.

## Details

### 1. Architectural Structure
```
[ Kindle Browser ]
       │
       │ (1) HTTPS GET (or HTTP fallback)
       ▼
[ Cloudflare Worker (Edge) ]
       │──► (2) Edge Cache (Cloudflare Cache API)
       │──► (3) Upstream Fetch (FxTwitter / Syndication / RSS)
       │──► (4) Grayscale Image Dithering / HTML SSR
       ▼
[ Kindle Browser receives pure, pre-rendered e-ink HTML ]
```

### 2. Core Capabilities
1. **Zero Persistent Server Overhead**:
   - Executes only when the Kindle requests a page; terminates immediately upon response completion.
   - 100% free tier (100,000 requests/day, which translates to reading thousands of pages daily without cost).
2. **Server-Side Rendering (SSR) for Legacy Kindles**:
   - Ancient Kindles (firmware < 5.16) with broken JavaScript engines or low RAM can receive pre-rendered HTML cards.
   - The worker can generate static HTML decks with zero JS required on the device.
3. **Image Optimization & Dithering**:
   - The worker can intercept tweet images, downscale them to 800px width, convert them to 4-bit grayscale, and compress them to < 20KB before transmitting to the Kindle, reducing memory strain.
4. **Resilient Failover**:
   - If one upstream API fails or is rate-limited, the worker can automatically fail over to an alternate provider (e.g. FxTwitter -> Twitter Syndication -> RSSHub).

### 3. Trade-Off Analysis
| Advantages | Disadvantages |
| :--- | :--- |
| **No server to manage**: Serverless, zero maintenance. | **Deployment Step**: Requires running `wrangler deploy` once. |
| **Bypasses CORS entirely**: Injects `Access-Control-Allow-Origin: *`. | **Third-party proxy dependency**: Uses Cloudflare infrastructure. |
| **Compatible with older Kindles**: Can serve pre-rendered HTML. | **Public data only**: Cannot access private feeds without passing cookies. |

## Related
- [[client-only-static-architecture]]
- [[cors-and-browser-security]]
- [[e-ink-image-dithering]]
- [[architectural-decision-matrix]]

## Sources
- raw/server-vs-serverless-tradeoffs.md
- raw/twitter-api-landscape-and-nitter-history.md
