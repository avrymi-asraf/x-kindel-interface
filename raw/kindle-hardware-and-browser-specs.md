# Raw Source: Kindle Hardware & Browser Specifications

## 1. Hardware Generations and Display Technology

Amazon Kindle e-readers utilize electrophoretic display (EPD) technology, manufactured primarily by E Ink Corporation (Pearl, Carta 1000, Carta 1200, and Carta 1300):

| Model Family | Screen Size | Resolution | Pixel Density | Typical Display Controller |
| :--- | :--- | :--- | :--- | :--- |
| **Kindle Basic (10th/11th Gen)** | 6.0" | 1072 × 1448 | 300 PPI (11th) / 167 PPI (10th) | E-Ink Carta, i.MX6/MT8183 |
| **Kindle Paperwhite 4 (10th Gen)** | 6.0" | 1072 × 1448 | 300 PPI | E-Ink Carta HD |
| **Kindle Paperwhite 5 (11th Gen)** | 6.8" | 1236 × 1648 | 300 PPI | E-Ink Carta 1200 |
| **Kindle Oasis 2 / 3** | 7.0" | 1264 × 1680 | 300 PPI | E-Ink Carta |
| **Kindle Scribe** | 10.2" | 1860 × 2480 | 300 PPI | E-Ink Carta 1200 |

### E-Ink Refresh Mechanics
1. **Electrophoretic Microcapsules**: Titanium dioxide (white) and carbon black particles suspended in clear fluid move when an electric field is applied.
2. **Refresh Waveforms**:
   - **Global Refresh (Full Inversion Flash)**: All pixels are driven to black, then white, then to the target state. Eliminates ghosting completely, but causes a jarring full-screen flash and takes 400–600ms.
   - **Partial Refresh**: Only pixels that transition are driven. Takes 120–250ms, without a black flash. Ghosting accumulates over multiple partial refreshes.
   - **Regal Waveform**: Proprietary Carta waveform algorithm that clears ghosting during partial updates without a global flash.
3. **Browser Triggering Rules**:
   - Full URL navigation (`window.location = ...`) triggers a window blanking cycle and almost always forces the hardware controller into a full inversion flash.
   - In-place DOM updates (mutating `textContent` or toggling `display: block / none`) allow the controller to perform a clean partial refresh of only the mutated rectangle.
   - Any CSS transitions (`transition: all 0.3s ease`), animations (`@keyframes`), or smooth scrolling (`scroll-behavior: smooth`) cause rapid micro-repaints, saturating the e-ink refresh queue and resulting in unreadable blurring and controller freezes.

---

## 2. Browser Engine Evolution: Legacy WebKit vs. Chromium (Firmware 5.16.4+)

Amazon silently upgraded the Kindle browser engine in firmware release **5.16.4** (late 2023):

### Pre-5.16.4 Era: "Experimental Browser" (Legacy WebKit)
- **Engine**: Ancient WebKit fork (circa 2011–2014, similar to Safari 5/6).
- **HTML5Test Score**: ~152 / 555.
- **JavaScript**: Restricted ES3 / partial ES5. No `let`/`const`, no arrow functions, no Promises, no `async/await`, no `fetch()`, no `Map`/`Set`.
- **CSS Support**: No Flexbox (or obsolete `-webkit-box`), no CSS Grid, no `calc()`, no CSS custom properties (`var(--color)`).
- **Root Certificates**: Extremely outdated root certificate store. Many modern Let's Encrypt certificates (ISRG Root X1 / DST Root CA X3) fail with "Invalid Certificate" or "Unable to establish secure connection".
- **Local Access**: Allowed browsing local files via `file:///mnt/us/` on some jailbroken/developer builds.

### Post-5.16.4 Era: Modern Chromium Engine
- **Engine**: Stripped-down Chromium engine (Blink/V8).
- **HTML5Test Score**: ~460+ / 555.
- **JavaScript**: Full ES6+ support (modern `fetch`, Promises, `async/await`, classes, template literals).
- **CSS Support**: Modern Flexbox, CSS Grid, CSS Variables, `clamp()`, media queries.
- **Security & TLS**: Modern TLS 1.2 / TLS 1.3 support with updated trust store.
- **Constraints**:
  - Extremely constrained RAM: Kindle OS assigns a strict memory cap (often < 150MB) to the browser process. Web pages with heavy JS frameworks (React, Angular, Vue bundles > 500KB) trigger out-of-memory browser tab crashes.
  - Slow single-core CPU processing: Complex JS execution blocks the UI thread for seconds.
  - "Experimental" banner or low-memory notice remains active.

---

## 3. Kindle Viewport & Touch Hardware Characteristics

- **Device Pixel Ratio (DPR)**: The browser often reports `window.devicePixelRatio = 1.0` or `1.5` despite having 300 PPI physical resolution.
- **Default Viewport Fallback**: If `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is omitted, the browser renders an emulated 980px or 1024px desktop page, resulting in microscopic, unreadable text.
- **Touch Screen Latency**: Capacitive or infrared touch digitizers on Kindle have high latency (100–250ms). Fast double-taps or drag gestures often drop events.
- **Physical Buttons (Oasis / Page-Turn Remotes)**:
  - Generate standard key events: `ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`.
