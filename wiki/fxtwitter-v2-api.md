# FxTwitter v2 API

## Summary
The FxTwitter v2 API (`api.fxtwitter.com/2/`) is an open, unauthenticated REST API operated by the FxEmbed project on Cloudflare Workers. It exposes structured tweet, profile, and timeline data with permissive CORS headers (`*`), making it the premier public data source for a client-side Kindle X interface.

## Details

### 1. Architectural Overview
- **Host**: `https://api.fxtwitter.com`
- **Framework**: Hono with `@hono/zod-openapi` on Cloudflare Workers.
- **Upstream Connection**: Acts as an edge intermediary, pooling guest sessions and reverse-engineered syndication feeds.
- **CORS Support**: Returns `access-control-allow-origin: *` and `access-control-allow-methods: GET, HEAD, OPTIONS` on preflight requests.
- **Rate Limit**: ~1,000 requests per minute per IP address.

### 2. Verified Endpoints & Schemas

#### A. User Timeline (Profile Statuses)
- **Path**: `GET /2/profile/{handle}/statuses`
- **Query Parameters**:
  - `cursor` (string, optional): Pagination cursor obtained from `cursor.bottom` of the previous response.
- **Response Format**:
  ```json
  {
    "code": 200,
    "cursor": {
      "top": "DAAHCgABHURU7URA...",
      "bottom": "DAAHCgABHURU7UQ__-wL..."
    },
    "results": [
      {
        "id": "2105909609487872075",
        "url": "https://x.com/handle/status/...",
        "text": "Full tweet text content...",
        "created_at": "Thu Apr 30 17:28:50 +0000 2026",
        "created_timestamp": 1777570130,
        "likes": 6184,
        "reposts": 811,
        "replies": 378,
        "bookmarks": 6422,
        "is_note_tweet": false,
        "author": {
          "id": "33836629",
          "name": "Display Name",
          "screen_name": "handle",
          "avatar_url": "https://pbs.twimg.com/...",
          "followers": 4331482
        },
        "media": {
          "all": [
            {
              "type": "photo",
              "url": "https://pbs.twimg.com/media/...",
              "width": 1200,
              "height": 800
            }
          ]
        },
        "quote": null,
        "reposted_by": null
      }
    ]
  }
  ```

#### B. Individual Status
- **Path**: `GET /:handle/status/:id` (v1) or `GET /2/status/:id` (v2)
- Returns complete metadata for a single tweet, including conversational context.

### 3. Integration Advantages for Kindle Interface
1. **Zero Server Requirement**: Because `api.fxtwitter.com` supports CORS, a static HTML/JS file running in the Kindle browser can fetch directly without needing an intermediary backend server.
2. **Built-in Pagination**: The `cursor.bottom` string provides seamless cursor-based pagination across infinite profile pages.
3. **Clean Media Objects**: Provides direct URLs to optimized image thumbnails rather than complex video blobs.

### 4. Known Edge Cases and Limitations
> ⚠️ Contradicts [[authenticated-timeline-scraping]] on user personalization
- **Public Data Only**: Cannot fetch private user feeds ("Following" timeline, personalized "For You" stream, private lists, or bookmarks) without login cookies.
- **Search Endpoint**: `/2/search?q={query}` is frequently locked upstream by X and returns 404 or 400.

## Related
- [[twitter-syndication-protocol]]
- [[client-only-static-architecture]]
- [[zero-scroll-deck-pagination]]
- [[cors-and-browser-security]]

## Sources
- raw/twitter-api-landscape-and-nitter-history.md
- raw/live-api-probes-and-cors-verification.md
