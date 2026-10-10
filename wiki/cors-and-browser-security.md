# CORS and Browser Security

## Summary
Cross-Origin Resource Sharing (CORS) and browser security models govern what resources a web page running on a Kindle can fetch over the network. Overcoming CORS restrictions is essential when designing a zero-server or client-first architecture for accessing Twitter data.

## Details

### 1. The Same-Origin Policy (SOP) Constraint
When a web app is loaded from origin `A` (e.g., `https://my-kindle-reader.github.io` or `file:///mnt/us/index.html`):
- The browser permits requests to origin `B` (e.g., `https://api.twitter.com` or `https://cdn.syndication.twimg.com`) only if origin `B` returns HTTP headers allowing origin `A`:
  ```http
  Access-Control-Allow-Origin: *
  ```
- Twitter's official syndication endpoint (`cdn.syndication.twimg.com`) explicitly responds with:
  ```http
  Access-Control-Allow-Origin: https://platform.twitter.com
  ```
- Result: Standard web browsers (including the Kindle Chromium engine) immediately abort the `fetch()` call and throw a `TypeError: Failed to fetch (CORS header missing)` error.

### 2. Solutions for Client-Side Architecture

#### Solution A: Utilizing CORS-Friendly Edge APIs
The FxTwitter v2 API (`api.fxtwitter.com`) provides full CORS support:
```http
access-control-allow-origin: *
access-control-allow-headers: *
access-control-allow-methods: GET, HEAD, OPTIONS
```
Any static client hosted on GitHub Pages or Cloudflare Pages can fetch directly from this endpoint without encountering CORS blocking.

#### Solution B: Serverless CORS Proxy (Edge Worker)
If an endpoint lacks CORS headers or upstream changes occur, a 15-line Cloudflare Worker can intercept the request, fetch the upstream data, and append permissive CORS headers:
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const response = new Response(upstream.body, upstream);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }
};
```

#### Solution C: Local Network / Same-Origin Server
When running a local companion script (see [[local-lan-companion-architecture]]), the web app and the API are served from the same local origin (e.g., `http://192.168.1.50:8000`), completely bypassing cross-origin security rules.

## Related
- [[twitter-syndication-protocol]]
- [[fxtwitter-v2-api]]
- [[client-only-static-architecture]]
- [[cloudflare-worker-serverless-architecture]]
- [[local-lan-companion-architecture]]

## Sources
- raw/live-api-probes-and-cors-verification.md
- raw/server-vs-serverless-tradeoffs.md
