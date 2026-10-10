# Twitter Syndication Protocol

## Summary
The Twitter Syndication Protocol refers to the public endpoints maintained by X (formerly Twitter) to power embedded tweets, web widgets, and oEmbed consumers across the external internet. While unauthenticated, it is constrained by strict CORS headers, bot prevention barriers, and token generation algorithms.

## Details

### 1. Underlying Endpoints
Twitter operates several syndication and widget services:

1. **`cdn.syndication.twimg.com/tweet-result?id={id}`**:
   - Primary endpoint returning individual post metadata in JSON.
   - Headers:
     ```http
     access-control-allow-origin: https://platform.twitter.com
     cache-control: no-cache, no-store
     content-type: application/json; charset=utf-8
     ```
   - **The CORS Blocker**: Because `access-control-allow-origin` is explicitly set to `https://platform.twitter.com`, browser security policies block any third-party web origin (such as a GitHub Pages site or localhost) from accessing the JSON payload.
   - **Token Requirement**: In 2023–2024, X introduced token verification (`&token=...`) calculated via a proprietary hash of the tweet ID to prevent automated scrapers from hitting this endpoint without X's embed JavaScript.

2. **`syndication.twitter.com/srv/timeline-profile/screen-name/{username}`**:
   - An endpoint designed to render an iframe of recent posts for a public profile.
   - **Bot Protection & Rate Limiting**: Protected by Cloudflare Bot Management (`__cf_bm` cookie) and aggressive IP rate limiting (30 requests/period). Direct programmatic requests return `HTTP/2 429 Too Many Requests`.

3. **`publish.twitter.com/oembed?url={url}`**:
   - The standard oEmbed endpoint.
   - Returns a small HTML snippet (`<blockquote>...</blockquote>`) rather than raw structured data or full timeline feeds.

### 2. Implications for Kindle Interface Architecture
- Direct client-side calls from a Kindle browser to Twitter's syndication endpoints are completely blocked by CORS and rate limits.
- Bypassing these restrictions requires either an intermediary edge service (see [[fxtwitter-v2-api]] and [[cloudflare-worker-serverless-architecture]]) or a local proxy daemon (see [[local-lan-companion-architecture]]).

## Related
- [[fxtwitter-v2-api]]
- [[cors-and-browser-security]]
- [[nitter-architecture-analysis]]
- [[cloudflare-worker-serverless-architecture]]

## Sources
- raw/twitter-api-landscape-and-nitter-history.md
- raw/live-api-probes-and-cors-verification.md
