# E-Ink Typography and Contrast

## Summary
E-Ink typography and contrast design principles dictate how visual elements, fonts, colors, and layout borders must be structured to achieve optimal legibility on 300 PPI reflective grayscale Kindle screens without pixel wash-out.

## Details

### 1. The Grayscale Dilemma
E-Ink screens typically support only 16 levels of gray (4-bit depth).
When standard mobile web CSS is displayed:
- Gray text such as `#657786` or `#8899a6` (Twitter's default secondary text colors) falls into middle-gray quantization bins, appearing washed out and difficult to read in direct sunlight.
- Drop shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.1)`) turn into coarse, speckled dither noise.
- Low-contrast active borders or thin 1px lines disappear entirely.

### 2. High-Contrast Rules of Engagement
1. **Binary Color Polarity**:
   - Background: Pure White (`#FFFFFF`).
   - Primary Text: Pure Black (`#000000`).
   - Secondary Text (Handles, timestamps, metadata): Dark Charcoal (`#222222` to `#333333`). Never exceed `#444444`.
2. **Solid Borders**:
   - All dividers, buttons, and card containers must use solid borders: `border: 2px solid #000000`.
3. **Typography Selection**:
   - Amazon's Bookerly or system serif fonts provide sharp contrast and comfortable reading cadence:
     ```css
     font-family: "Bookerly", "Georgia", "Baskerville", -apple-system, BlinkMacSystemFont, "Segoe UI", serif;
     ```
   - Font scale: `font-size: clamp(20px, 3.2vw, 26px);`
   - Line height: `line-height: 1.55;`
   - Letter spacing: `letter-spacing: 0.015em;`
4. **Touch Target Dimensions**:
   - Minimum tap target height/width: 48px by 48px to account for the imprecise capacitive touch digitizer on Kindle e-readers.

## Related
- [[e-ink-refresh-mechanics]]
- [[zero-scroll-deck-pagination]]
- [[e-ink-image-dithering]]

## Sources
- raw/e-ink-ui-ux-design-patterns.md
- raw/kindle-hardware-and-browser-specs.md
