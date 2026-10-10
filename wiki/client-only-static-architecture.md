# Client-Only Static Architecture

## Summary
The Client-Only Static Architecture is a zero-server implementation model where the Kindle interface exists as a single, self-contained HTML/CSS/JS file. It fetches live tweet feeds directly from public CORS-enabled endpoints (such as [[fxtwitter-v2-api]]) without requiring any running backend or cloud infrastructure.

## Details

### 1. Architectural Structure
```
[ Kindle Browser ] 
       │
       │ (1) Direct HTTPS Fetch (CORS: *)
       ▼
[ api.fxtwitter.com ] ──► [ X / Twitter Upstream ]
```
- **Distribution**: Hosted on GitHub Pages, Cloudflare Pages, Netlify, or loaded via Kindle browser bookmark.
- **Backend Components**: **Zero**. No servers, no Docker containers, no subscriptions, no cron jobs.

### 2. Client-Side Lifecycle
1. **Boot**: The page loads a minimal ~15KB HTML file containing high-contrast e-ink CSS and a lightweight vanilla JS controller.
2. **Profile Selection**:
   - The user enters a handle (e.g. `karpathy`, `elonmusk`, `sama`) or selects from locally saved favorites stored in `localStorage`.
3. **Data Fetch**:
   - Executes:
     ```javascript
     const res = await fetch(`https://api.fxtwitter.com/2/profile/${handle}/statuses`);
     const data = await res.json();
     tweets = data.results;
     nextCursor = data.cursor.bottom;
     ```
4. **Deck Presentation**:
   - Initializes the [[zero-scroll-deck-pagination]] view at index 0.
   - User navigates page-by-page using touch taps or Oasis physical buttons.
5. **Continuous Prefetching**:
   - When reaching tweet 15 of 20, silently fetches the next page using `?cursor=${nextCursor}` and appends results.

### 3. Trade-Off Analysis
| Advantages | Disadvantages |
| :--- | :--- |
| **Zero Infrastructure**: No server to monitor, crash, or pay for. | **Public Data Only**: Cannot view authenticated "For You" timeline. |
| **Instant Setup**: Deploy once to GitHub Pages and bookmark on Kindle. | **Firmware Dependency**: Requires Kindle with modern TLS (>= 5.16.4). |
| **Offline Caching**: Viewed tweets remain cached in memory or `localStorage`. | **Third-Party Dependency**: Relies on `api.fxtwitter.com` remaining operational. |

> ⚠️ Contradicts [[local-lan-companion-architecture]] on authenticated timeline access

## Related
- [[fxtwitter-v2-api]]
- [[zero-scroll-deck-pagination]]
- [[cors-and-browser-security]]
- [[architectural-decision-matrix]]

## Sources
- raw/todo-requirements.md
- raw/server-vs-serverless-tradeoffs.md
- raw/live-api-probes-and-cors-verification.md
