# Authenticated Timeline Scraping

## Summary
Authenticated timeline scraping refers to programmatic extraction of a user's private, personalized Twitter timeline ("Following" feed, "For You" algorithm feed, Bookmarks, and Lists) using active browser session cookies (`auth_token` and `ct0`).

## Details

### 1. The Need for Session Credentials
Public APIs like [[fxtwitter-v2-api]] and [[twitter-syndication-protocol]] can only fetch public profiles and standalone tweets. To read:
- A user's home timeline
- Private lists
- Bookmarked tweets
The request must include active session credentials.

### 2. Protocol Details
Twitter's internal web client communicates via GraphQL endpoints:
- **Base Endpoint**: `https://x.com/i/api/graphql/{query_id}/HomeTimeline` or `HomeLatestTimeline`
- **Required Headers**:
  - `authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA` (static public web client bearer token)
  - `x-csrf-token: {ct0_cookie}`
  - `cookie: auth_token={auth_token}; ct0={ct0_cookie}`
  - `x-twitter-active-user: yes`
  - `x-twitter-client-language: en`

### 3. Safety and Anti-Ban Measures
When implementing authenticated scraping in a local companion service (see [[local-lan-companion-architecture]]):
1. **Low Request Velocity**: Read requests should occur at human reading speed (e.g. 1 request every 5–10 minutes for batches of 40 tweets). Never poll aggressively.
2. **Never Write or Mutate State**: The scraper must be strictly read-only (`GET` queries). It must never like, retweet, or post tweets, which trigger anti-spam heuristics.
3. **Session Cookie Isolation**: Keep session tokens stored in a local `.env` or config file that is strictly `.gitignore`'d.

## Related
- [[local-lan-companion-architecture]]
- [[fxtwitter-v2-api]]
- [[nitter-architecture-analysis]]

## Sources
- raw/twitter-api-landscape-and-nitter-history.md
- raw/server-vs-serverless-tradeoffs.md
