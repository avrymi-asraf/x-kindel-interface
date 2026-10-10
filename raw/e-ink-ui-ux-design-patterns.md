# Raw Source: E-Ink Web UI/UX Design Patterns & Display Ergonomics

## 1. The Physics of E-Ink and Cognitive Load

Standard web interfaces assume 60Hz or 120Hz refresh rates, smooth scrolling, and full 24-bit RGB color.
When rendered on an E-Ink Kindle:
- **Scrolling is unusable**: Continuous scrolling turns the display into an unreadable smear of flashing gray pixels while the CPU struggles with constant repaints.
- **Low Contrast is unreadable**: Subtle light-gray typography (`#888888`), soft drop-shadows (`box-shadow`), and pastel colors wash out completely, rendering as muddy white or faint dithering.
- **Flashing Causes Fatigue**: When a full-screen hardware refresh (inversion flash) triggers, the user loses their place and reading rhythm.

---

## 2. The "Deck" (Paginated Card) Pattern

To mimic the physical book reading experience on Kindle:
- **Zero Scroll Viewport**:
  ```css
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    touch-action: manipulation;
  }
  ```
- **Single Active Card (or Fixed Height Slot)**:
  - The interface displays ONE tweet per view (or a fixed 2-tweet split if short).
  - Tweet cards are positioned inside a container:
    ```css
    .tweet-card {
      display: none;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 24px;
    }
    .tweet-card.active {
      display: block;
    }
    ```
- **Partial Refresh Optimization**:
  - Toggling `display: none` and `display: block` across pre-rendered DOM elements (or updating `textContent` in place) changes only the necessary pixel microcapsules.
  - The surrounding chrome (navigation bar, page indicators, handle header) remains completely static. The e-ink controller triggers only a fast partial update with zero screen flash.

---

## 3. Ergonomic Touch & Hardware Button Zones

A Kindle is held in one hand or two hands while reading:
- **Screen Touch Zones**:
  - **Left 30% of screen**: Tap to go to **Previous Tweet** (`prev()`).
  - **Right 70% of screen**: Tap to go to **Next Tweet** (`next()`).
  - **Top 15% banner**: Tap to reveal **Menu / Navigation / Handle Input**.
- **Hardware Page-Turn Buttons (Kindle Oasis & Remote Page Turners)**:
  - Event listener on `window.addEventListener('keydown', e => ...)`:
    - `ArrowRight`, `PageDown`, `Space`, `j`, `ArrowDown` -> `next()`
    - `ArrowLeft`, `PageUp`, `k`, `ArrowUp` -> `prev()`

---

## 4. Typography & Visual Styling Rules for 300 PPI E-Ink

1. **Color Palette**:
   - Background: Pure White (`#FFFFFF`).
   - Body Text: Pure Black (`#000000`).
   - Secondary Text / Timestamps / Handles: Dark Charcoal (`#222222` or `#333333`). Never use `#777` or `#999`.
   - Borders: Solid `#000000` with 2px or 3px stroke.
2. **Typography**:
   - System Serif or High-legibility Sans: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Bookerly", "Georgia", serif;`
   - Base Tweet Body Size: `22px` to `26px` (scaled with `clamp(20px, 3.5vw, 28px)`).
   - Line Height: `1.5` to `1.6` for comfortable reading.
   - Letter Spacing: `0.02em`.
3. **Animations**:
   ```css
   * {
     transition: none !important;
     animation: none !important;
     scroll-behavior: auto !important;
   }
   ```
4. **Media Handling (Photos/Images)**:
   - Convert images to high-contrast grayscale:
     ```css
     img.tweet-media {
       filter: grayscale(100%) contrast(125%);
       max-width: 100%;
       max-height: 40vh;
       border: 2px solid #000;
     }
     ```
   - Lazy load images or show a toggle button (`[Show Image]`) to prevent unnecessary bandwidth and RAM consumption on weak Kindle hardware.
