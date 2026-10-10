# Local LAN Companion Architecture

## Summary
The Local LAN Companion Architecture is a local-first, privacy-preserving execution model where a lightweight single-file Python script runs on the user's local machine or home network (laptop, PC, or Raspberry Pi). It serves unencrypted HTTP to the Kindle over local Wi-Fi, completely solving Kindle SSL certificate obsolescence and enabling access to authenticated, personalized Twitter feeds.

## Details

### 1. Architectural Structure
```
[ User PC / Raspberry Pi (LAN) ] 
       │ ── (1) Reads user auth_token cookie
       │ ── (2) Queries Twitter GraphQL HomeTimeline
       │ ── (3) Serves pure HTTP on :8000
       ▲
       │ (4) Local Wi-Fi (http://192.168.1.X:8000)
[ Kindle Browser (Any Generation) ]
```

### 2. Why This Model Excels for Kindle
1. **Solves the SSL/TLS Certificate Expiration Wall**:
   - Older Kindles (Paperwhite 2/3/4, Voyage, Touch running firmware < 5.16) cannot establish TLS connections to modern HTTPS websites due to expired root certificate stores.
   - By serving over plain local `http://192.168.1.X:8000`, the connection never performs an SSL handshake. **It works flawlessly on 100% of Kindle devices across all hardware generations.**
2. **Access to Personalized Feeds**:
   - Because the companion runs locally on the user's trusted machine, it can safely read the user's Twitter `auth_token` and `ct0` session cookies.
   - It fetches the user's real "Following" home timeline, curated lists, and saved bookmarks using authenticated GraphQL endpoints (e.g. `HomeLatestTimeline`).
3. **No External Server Running in the Cloud**:
   - Directly satisfies the user's desire: "I prefer to do it without using any running server outside".
   - Zero cloud hosting fees, zero external server maintenance, zero public IP exposure.
4. **Local Image Optimization**:
   - Uses Python Pillow (`PIL`) to dither and compress images locally before serving them to the Kindle.

### 3. Implementation Blueprint
A clean Python script using `uv` and standard libraries:
```python
# Context Header: Local LAN Companion Server for x-kindel-interface
# Serves high-contrast e-ink deck interface over plain HTTP to local Kindle.
# Connects to Twitter GraphQL or FxTwitter and handles pagination.

import http.server
import json
import urllib.request

PORT = 8000
# ...
```

### 4. Trade-Off Analysis
| Advantages | Disadvantages |
| :--- | :--- |
| **Universal Compatibility**: Works on all Kindle generations via HTTP. | **LAN Bound**: Only works when Kindle is on the same local Wi-Fi as the host machine. |
| **Personalized Timeline**: Can browse user's authenticated feed. | **Host Machine Awake**: User's PC/laptop or Raspberry Pi must be running while reading. |
| **Zero Cloud Exposure**: 100% private and local-first. | Requires starting the local script (`uv run ...`). |

> ⚠️ Contradicts [[client-only-static-architecture]] on cloud portability

## Related
- [[authenticated-timeline-scraping]]
- [[kindle-browser-runtime]]
- [[zero-scroll-deck-pagination]]
- [[architectural-decision-matrix]]

## Sources
- raw/todo-requirements.md
- raw/server-vs-serverless-tradeoffs.md
- raw/kindle-hardware-and-browser-specs.md
