# E-Ink Refresh Mechanics

## Summary
E-Ink refresh mechanics govern how electrophoretic microcapsules transition on Kindle displays. Understanding the physical differences between full-screen inversion refreshes (flashing) and partial refreshes is critical to designing a non-jarring, distraction-free reading experience.

## Details

### 1. Physical Principle of Electrophoretic Displays (EPD)
E-Ink screens contain millions of microcapsules filled with clear fluid and charged pigment particles:
- Negatively charged black pigment (carbon black)
- Positively charged white pigment (titanium dioxide)

Applying an electrical field moves particles to the surface. Unlike LCD or OLED displays that emit light and refresh at 60–120Hz, E-Ink screens are reflective and only consume power when pixels change position.

### 2. Full Inversion Refresh vs. Partial Refresh
The display controller employs different waveform algorithms depending on how the browser updates:

| Attribute | Full Refresh (Global Inversion) | Partial Refresh |
| :--- | :--- | :--- |
| **Visual Effect** | Screen flashes completely black, then white, then draws content | Only the changing pixels transition; rest of screen stays still |
| **Duration** | 400ms – 600ms | 120ms – 250ms |
| **Ghosting** | 100% eliminated | Accumulates slowly over successive updates |
| **Cognitive Impact** | High distraction; breaks reading flow | Feels like turning a physical book page |
| **Web Trigger** | URL navigation (`window.location`), heavy full-page re-renders | Localized in-place DOM updates (`textContent`, `display: none/block`) |

### 3. Avoiding the Flash: Architectural Rules for Frontends
To prevent triggering full-screen hardware flashes:
1. **Never perform full-page navigations**: Avoid `<a href="...">` page reloads. Use an in-page state machine that swaps tweet content inside pre-existing DOM containers.
2. **Eliminate all CSS transitions and animations**:
   ```css
   *, *::before, *::after {
     transition: none !important;
     animation: none !important;
     scroll-behavior: auto !important;
   }
   ```
   CSS transitions cause 30–60 micro-repaints per second, overwhelming the EPD controller queue and producing blurry, illegible artifacts.
3. **Keep Chrome Elements Static**: The navigation header, page counter, and controls must occupy fixed positions and never shift layout dimensions during card transitions.
4. **Periodic Intentional Flush**: After 15–20 partial card turns, ghosting can become noticeable. Providing a manual "Clean Screen" button (which quickly inverts the screen or toggles an empty white canvas for 100ms) gives the user control to eliminate ghosting without unsolicited flashing.

## Related
- [[kindle-browser-runtime]]
- [[zero-scroll-deck-pagination]]
- [[e-ink-typography-and-contrast]]

## Sources
- raw/kindle-hardware-and-browser-specs.md
- raw/e-ink-ui-ux-design-patterns.md
