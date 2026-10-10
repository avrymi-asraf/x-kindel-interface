# Raw Source: Twitter/X API Landscape, Nitter Architecture & Modern Alternatives

## 1. Nitter Architecture & Demise (2019 – August 2026)

### Historical Architecture
- **Language & Stack**: Written in Nim with `jester` web framework and `libcurl`.
- **Operating Model**:
  - Reverse-engineered Twitter's private GraphQL endpoints.
  - Required no JavaScript on the client side; generated 100% server-side HTML.
  - Used "guest accounts": In the past, Twitter allowed unauthenticated visitors to generate guest tokens (`flow_token` / `gt` cookies) via `api.twitter.com/1.1/guest/activate.json`.
  - Nitter pooled these guest tokens in Redis and rotated them to fetch tweets without user login.
- **Why Nitter Failed**:
  1. **Phase 1 (Jan 2024)**: X Corp completely removed the unauthenticated guest token endpoint (`/guest/activate.json`). Unauthenticated requests to GraphQL endpoints began returning `403 Forbidden` or `429 Rate Limit Exceeded`.
  2. **Phase 2 (2024–2025)**: Nitter instances attempted to stay online by using real user account credentials (`auth_token` cookies). These accounts were aggressively detected and banned by X's anti-bot systems.
  3. **Phase 3 (August 2026)**: X Corp sent formal cease-and-desist legal notices to the maintainer (`zedeus`) and associated proxy operators (XCancel). The GitHub repository was officially archived and moved to read-only mode. Public instances ceased operation.

---

## 2. Twitter/X Official API (v2) Reality
- **Pricing & Tier Structure**:
  - **Free Tier**: Write-only (cannot read tweets, 0 read requests).
  - **Basic Tier**: $100/month (10,000 tweets/month read limit).
  - **Pro Tier**: $5,000/month (1,000,000 tweets/month).
- **Feasibility for Kindle Interface**:
  - The official API is financially prohibitive for personal hobbyist readers or open-source projects.

---

## 3. Twitter Syndication & Embed Infrastructure

Twitter provides official embed services intended for embedding individual posts and timelines on news sites and blogs:

1. **`cdn.syndication.twimg.com/tweet-result?id={tweet_id}`**:
   - Returns full JSON metadata for an individual post without authentication.
   - However, X protects it with:
     - Strict CORS: `access-control-allow-origin: https://platform.twitter.com` (blocks any external web origin).
     - Token algorithms: Newer requests require a token calculation (`token={hash}`) derived from the tweet ID.
2. **`syndication.twitter.com/srv/timeline-profile/screen-name/{username}`**:
   - Returns an HTML iframe document of recent posts for a public profile.
   - Protected by Cloudflare Bot Management (`__cf_bm` cookie) and aggressive IP rate limiting (30 requests/period). Direct cURL requests return `HTTP/2 429`.

---

## 4. Unofficial Edge APIs: FixTweet / FxEmbed (v2 API)

The FxEmbed project (originally created to fix Twitter card previews on Discord/Telegram) maintains a public edge API deployed on Cloudflare Workers (`api.fxtwitter.com`):

### Supported v2 Endpoints
- **Status Metadata**: `GET https://api.fxtwitter.com/2/status/:id`
- **Profile Statuses (Timeline)**: `GET https://api.fxtwitter.com/2/profile/:handle/statuses`
  - Accepts pagination cursor: `?cursor={cursor_string}`
  - Returns array of `results` (20 tweets per page) + `cursor.bottom` for next page.
  - Returns rich author details, media URLs, retweets, quote tweets, and full text.
- **Search (Restricted)**: `GET https://api.fxtwitter.com/2/search?q={query}` (often returns 404/400 without upstream session).
- **Rate Limits**: ~1,000 requests per minute per IP.
- **CORS Support**: Returns `access-control-allow-origin: *` on OPTIONS preflight and standard responses.

---

## 5. Authenticated Scraping via GraphQL (Twikit / Python Scraper)

For accessing personalized timelines ("Following", "For You", Bookmarks, Lists), direct client-side unauthenticated fetching is impossible because X requires session cookies.
- **Mechanism**:
  - Emulate browser headers:
    - `authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA` (Twitter's public web client bearer token).
    - `x-csrf-token: {ct0_cookie}`
    - `cookie: auth_token={auth_token}; ct0={ct0_cookie}`
  - Queries:
    - `HomeTimeline` / `HomeLatestTimeline` GraphQL endpoints with query hash ID.
- **Feasibility**:
  - Feasible only via a companion service (e.g. local Python micro-daemon) running on the user's home computer or local LAN.
