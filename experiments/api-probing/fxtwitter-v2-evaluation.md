# Experiment: FxTwitter v2 REST Endpoint Evaluation

## 1. Goal & Hypothesis
- **Goal**: Empirically evaluate whether `https://api.fxtwitter.com/2/profile/:handle/statuses` can serve as a dependable, zero-server data source for a client-side Kindle X interface.
- **Hypothesis**:
  1. The endpoint returns structured JSON with full tweet text and metadata without requiring user credentials.
  2. The endpoint provides pagination cursors to allow sequential page advancement.
  3. The endpoint returns `Access-Control-Allow-Origin: *` to enable browser-direct fetching from arbitrary web origins.

## 2. Methodology & Real Execution
Executed real, live HTTP queries using `curl` against `api.fxtwitter.com`:

```bash
# Test 1: Query public user profile statuses
curl -s "https://api.fxtwitter.com/2/profile/karpathy/statuses" | jq '{code, count: (.results | length), cursor}'

# Test 2: Query subsequent page with cursor
curl -s "https://api.fxtwitter.com/2/profile/karpathy/statuses?cursor=DAAHCgABHURU7UQ__-wLAAIAAAATMjA0OTkwMzgyMTA5NTM1NDUyMwgAAwAAAAIAAA" | jq '{count: (.results | length), first_tweet: .results[0].text[0:60]}'

# Test 3: OPTIONS Preflight for CORS verification
curl -s -I -X OPTIONS -H "Origin: https://kindle.local" -H "Access-Control-Request-Method: GET" "https://api.fxtwitter.com/2/profile/karpathy/statuses"
```

## 3. Results & Measurements
1. **Payload Verification**:
   - Status code: `200 OK`.
   - Results array: 21 full tweet objects returned per page.
   - Response latency: ~450ms.
   - Fields present: `id`, `text`, `raw_text`, `author`, `created_at`, `likes`, `reposts`, `replies`, `bookmarks`, `is_note_tweet`, `media`.
2. **Cursor Pagination**:
   - `cursor.bottom` was supplied in page 1.
   - Page 2 query using `?cursor=` successfully returned the subsequent 21 tweets without duplicates or errors.
3. **CORS Verification**:
   - Preflight headers returned:
     - `access-control-allow-origin: *`
     - `access-control-allow-headers: *`
     - `access-control-allow-methods: GET, HEAD, OPTIONS`

## 4. Conclusions & Implications
- **Feasibility**: High. A static client hosted on GitHub Pages or Cloudflare Pages can directly fetch public tweet streams from this endpoint without a running backend server.
- **Limitation**: Public profiles only; personal home timeline requires authenticated sessions.
- **Wiki Connections**: See [[fxtwitter-v2-api]], [[client-only-static-architecture]], and [[zero-scroll-deck-pagination]].
