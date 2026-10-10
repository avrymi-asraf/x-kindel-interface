# Kindle X Interface (x-kindel-interface)

An e-ink friendly, zero-scroll deck reader for browsing X (Twitter) on Amazon Kindle e-readers.

Designed specifically for e-ink display ergonomics:
- **Zero Continuous Scroll**: Discrete page-by-page tweet deck navigation.
- **Flashing Minimization**: In-place DOM mutations update text without triggering full-screen hardware inversion flashes.
- **Zero External Server Requirement (Option 1)**: 100% client-side static web application that connects directly to public Twitter data streams with CORS support.
- **High-Contrast Typography**: Pure black and white styling, solid 2px borders, Bookerly/Georgia serif font stack.
- **Ergonomic Kindle Navigation**:
  - Tap **Right 70%** of screen: Next tweet.
  - Tap **Left 30%** of screen: Previous tweet.
  - **Hardware Buttons**: Native support for Kindle Oasis page-turn buttons and Bluetooth remotes (`PageDown`, `PageUp`, `ArrowRight`, `ArrowLeft`, `Space`).
  - **Auto-Chunking for Long Posts**: Note-tweets and long posts (> 750 characters) are automatically split into `Part 1/2`, `Part 2/2` sub-pages so content **never** overflows or requires scrolling.
  - **RAM-Safe Media**: Images are filtered to high-contrast grayscale and tucked behind a `[📷 Show Image]` button to prevent memory crashes on low-RAM Kindle hardware.

---

## Quick Start (Option 1: Zero Server)

### Method A: Host on GitHub Pages (Zero Server, Zero Cost)
1. Push this repository to GitHub.
2. Go to repository **Settings** → **Pages**.
3. Under **Branch**, select `main` and folder `/src` (or root).
4. On your Kindle's web browser, open and bookmark:
   ```text
   https://<your-username>.github.io/x-kindel-interface/
   ```
5. You can now browse any public creator or account on your Kindle anytime with **no server running anywhere**.

### Method B: Local Companion Server (Optional Fallback)
If you have an older Kindle (firmware < 5.16) with expired SSL certificates, or want to read over local Wi-Fi:
```bash
python3 companion.py
```
Open `http://<your-computer-lan-ip>:8000` on your Kindle browser.

---

## Features & Controls

| Action | How to Trigger |
| :--- | :--- |
| **Next Tweet** | Tap right 70% of screen, or press `ArrowRight` / `PageDown` / `Space` / `j` |
| **Previous Tweet** | Tap left 30% of screen, or press `ArrowLeft` / `PageUp` / `k` |
| **Switch Account** | Tap `[≡ Accounts]` in top-left or tap `@handle` |
| **Save/Remove Favorite** | Tap `[★]` or `[☆]` in the top bar |
| **Flush Ghosting** | Tap `[Clean]` in top-right to trigger an intentional 60ms inversion |
| **View Image** | Tap `[📷 Show Image]` on tweets with photos |
| **Read Replies** | Tap `[💬 Read Replies (N)]` on tweet card, tap metrics, or press `r` |
| **Back to Feed** | Tap `[← Back]` in top bar or press `b` / `Backspace` / `Escape` |

---

## Repository Architecture & Knowledge Base

This project maintains a compounding **Karpathy LLM Wiki** and live empirical research:

- [INDEX.md](INDEX.md) — Root wiki schema and taxonomy.
- [wiki/index.md](wiki/index.md) — Master catalog of 16 cross-linked entity pages.
  - `kindle-browser-runtime.md`: WebKit vs Chromium 5.16.4+ engine differences.
  - `e-ink-refresh-mechanics.md`: Electrophoretic waveforms, partial updates, and flashing.
  - `zero-scroll-deck-pagination.md`: The deck card pagination pattern.
  - `fxtwitter-v2-api.md`: Live-verified public REST API specifications.
  - `nitter-architecture-analysis.md`: Deconstruction of Nitter and why it was shut down.
  - `client-only-static-architecture.md`: In-depth analysis of Option 1.
- [experiments/](experiments/) — Ground-truth live API measurements and verification runs.
