# Raw Source: Live API Probes & Ground-Truth Verification

Date of Probes: 2026-10-10
Environment: Linux x86_64 WSL2

## Probe 1: Syndication Endpoint (`syndication.twitter.com`)
```bash
curl -s -I "https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk"
```
**Response**:
```http
HTTP/2 429 
date: Sat, 10 Oct 2026 12:49:58 GMT
content-type: text/plain;charset=utf-8
content-length: 20
perf: 7402827104
cache-control: no-cache, no-store, max-age=0
x-transaction-id: c2fb85ecda52edd6
x-rate-limit-limit: 30
x-rate-limit-reset: 1791636707
x-rate-limit-remaining: 0
server: cloudflare envoy
set-cookie: __cf_bm=...
```
**Conclusion**: `syndication.twitter.com` is actively protected by Cloudflare bot management and has rate limits of 30 req/period. Unusable for direct public fetching without rotating bot credentials.

---

## Probe 2: Tweet Result Syndication (`cdn.syndication.twimg.com`)
```bash
curl -s -I "https://cdn.syndication.twimg.com/tweet-result?id=20"
```
**Response**:
```http
HTTP/2 200 
access-control-allow-origin: https://platform.twitter.com
content-type: application/json; charset=utf-8
```
**Conclusion**: Strict CORS headers prevent any external browser domain from directly fetching this endpoint.

---

## Probe 3: FxTwitter Profile Statuses Endpoint (`api.fxtwitter.com`)
```bash
curl -s "https://api.fxtwitter.com/2/profile/karpathy/statuses" | jq '{code, count: (.results | length), cursor}'
```
**Response**:
```json
{
  "code": 200,
  "count": 21,
  "cursor": {
    "top": "DAAHCgABHURU7URAJv0LAAIAAAATMjEwNTkwOTYwOTQ4Nzg3MjA3NQgAAwAAAAEAAA",
    "bottom": "DAAHCgABHURU7UQ__-wLAAIAAAATMjA0OTkwMzgyMTA5NTM1NDUyMwgAAwAAAAIAAA"
  }
}
```
**Latency**: ~450ms.
**Data Returned**:
- Complete tweet content (`text`, `raw_text.display_text_range`, entities)
- Author details (`name`, `screen_name`, `avatar_url`, `followers`)
- Media attachments (`media.all`, photos, video thumbnails)
- Engagement metrics (`replies`, `reposts`, `likes`, `bookmarks`)
- Quoted tweets and retweets (`quote`, `reposted_by`)

---

## Probe 4: Pagination Verification
```bash
curl -s "https://api.fxtwitter.com/2/profile/karpathy/statuses?cursor=DAAHCgABHURU7UQ__-wLAAIAAAATMjA0OTkwMzgyMTA5NTM1NDUyMwgAAwAAAAIAAA" | jq '{count: (.results | length), first_tweet: .results[0].text[0:60]}'
```
**Response**:
```json
{
  "count": 21,
  "first_tweet": "New work with @AlecRad and @DavidDuvenaud:\n\nHave you ever dr"
}
```
**Conclusion**: Pagination via `?cursor=` parameter functions reliably and returns subsequent chunks of 20–21 tweets.

---

## Probe 5: CORS Verification on FxTwitter
```bash
curl -s -I -X OPTIONS -H "Origin: https://kindle.local" -H "Access-Control-Request-Method: GET" "https://api.fxtwitter.com/2/profile/karpathy/statuses"
```
**Response**:
```http
HTTP/2 200 
access-control-allow-origin: *
access-control-allow-headers: *
access-control-allow-methods: GET, HEAD, OPTIONS
```
**Conclusion**: `api.fxtwitter.com` explicitly supports cross-origin requests (`access-control-allow-origin: *`), permitting pure client-side web apps running from any origin (e.g., GitHub Pages, Cloudflare Pages, or localhost) to fetch tweet feeds directly.
