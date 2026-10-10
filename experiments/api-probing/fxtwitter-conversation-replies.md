# Experiment: FxTwitter v2 Conversation & Replies Endpoint Verification

## 1. Goal & Hypothesis
- **Goal**: Empirically evaluate whether `https://api.fxtwitter.com/2/conversation/:id` can deliver thread replies directly to the client with CORS support for Kindle e-ink deck navigation.
- **Hypothesis**:
  1. The endpoint accepts a status ID and returns an unauthenticated payload containing root tweet (`status`) and reply array (`replies`).
  2. Each reply in `replies` has structured metadata including `author`, `text`, `likes`, `replies`, and `replying_to`.
  3. Preflight OPTIONS requests confirm `Access-Control-Allow-Origin: *` for direct client access.

## 2. Methodology & Real Execution
Executed real, live HTTP queries using `curl` against `api.fxtwitter.com`:

```bash
# Test 1: Query conversation replies for tweet ID 2105909609487872075
curl -s "https://api.fxtwitter.com/2/conversation/2105909609487872075" | jq '{code, replies_count: (.replies | length), first_reply_author: .replies[0].author.screen_name}'

# Test 2: CORS Preflight verification
curl -s -I -X OPTIONS -H "Origin: https://kindle.local" -H "Access-Control-Request-Method: GET" "https://api.fxtwitter.com/2/conversation/2105909609487872075"
```

## 3. Results & Measurements
1. **Payload Verification**:
   - Status code: `200 OK`.
   - Replies count: 40 replies returned for the root status.
   - First reply author: `@Acezhang01`, replying to `@karpathy`.
   - Complete metadata present: `id`, `text`, `author`, `likes`, `reposts`, `replies`, `created_at`, `replying_to`.
2. **CORS Headers**:
   - `access-control-allow-origin: *`
   - `access-control-allow-methods: GET, HEAD, OPTIONS`
   - `access-control-allow-headers: *`
3. **Deck Integration**:
   - Successfully wired to in-deck page-by-page reader via `readReplies()` with hierarchical stack push/pop navigation.
   - Verified across light and dark modes with CDP test suite (`scripts/test_replies.js`).

## 4. Conclusions
The `/2/conversation/:id` endpoint fulfills all client-side requirements for reading Twitter replies on Kindle e-ink displays without requiring server-side rendering or authentication.
