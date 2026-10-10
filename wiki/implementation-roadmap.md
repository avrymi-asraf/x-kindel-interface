# Implementation Roadmap

## Summary
The Implementation Roadmap outlines the phased execution plan for constructing, verifying, and deploying the `x-kindel-interface` system, transitioning from research artifacts to a production-grade, zero-server Kindle reading experience.

## Details

### Phase 1: Prototype Core Zero-Scroll E-Ink Deck (Frontend Engine)
- **Objective**: Build a self-contained, high-contrast, zero-scroll web reader.
- **Deliverables**:
  - `src/index.html` (single-file architecture, or modular `index.html` + `app.js` + `style.css`).
  - Viewport locking (`100vh`, `overflow: hidden`).
  - Bookerly / Georgia high-contrast e-ink typography.
  - Large tap zones (30% left / 70% right) and keyboard listeners for physical page turn buttons (`ArrowLeft`/`ArrowRight`, `PageUp`/`PageDown`).
  - In-place DOM update engine that swaps tweet cards without full-screen inversion flashes.

### Phase 2: Live Data Integration with FxTwitter v2
- **Objective**: Connect the deck engine directly to live Twitter feeds without a backend server.
- **Deliverables**:
  - Data adapter for `https://api.fxtwitter.com/2/profile/:handle/statuses`.
  - Cursor-based pre-fetching engine: when user reaches tweet 15 of 20, fetch the next page in the background and append to the in-memory deck.
  - Local favorites & feed manager stored in `localStorage` (e.g. curated handles: `karpathy`, `sama`, `ylecun`).
  - Graceful error states and offline caching.

### Phase 3: E-Ink Visual Polish & Media Controls
- **Objective**: Ensure display stability across varying tweet contents.
- **Deliverables**:
  - Image handling: Grayscale contrast filtering (`grayscale(100%) contrast(125%)`) with an on-demand `[View Image]` toggle to protect Kindle RAM.
  - Note Tweet chunker: Split long-form posts (> 1,000 characters) across consecutive page slots so that text never overflows or scrolls.
  - Manual "Clean Screen" trigger to flush ghosting on demand.

### Phase 4: Local LAN Companion Mode (Universal / Older Kindle Fallback)
- **Objective**: Support older Kindles with expired SSL certificates and allow personalized "Following" timeline reading.
- **Deliverables**:
  - Single-file Python script (`companion.py` using `uv`).
  - Serves pure HTTP on port 8000 for local Wi-Fi.
  - Optional cookie loader (`auth_token` / `ct0`) to fetch personalized timelines.

### Phase 5: Verification and Live Testing
- **Objective**: Validate end-to-end functionality using real live data and browser automation.
- **Deliverables**:
  - Ground-truth CLI verification runs.
  - Live headless browser testing via WSL headless Chrome on port 9222.
  - Documentation of verified device behaviors.

## Related
- [[architectural-decision-matrix]]
- [[client-only-static-architecture]]
- [[zero-scroll-deck-pagination]]
- [[local-lan-companion-architecture]]

## Sources
- raw/todo-requirements.md
- raw/server-vs-serverless-tradeoffs.md
