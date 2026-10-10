# E-Ink Image Dithering

## Summary
E-Ink image dithering is the algorithmic process of converting full 24-bit color images into 1-bit monochrome (black & white) or 4-bit (16-level) grayscale images using spatial quantization algorithms. On Kindle displays, dithering prevents washed-out color gradients and dramatically reduces image file sizes and browser memory load.

## Details

### 1. The Rendering Challenge
When a color JPEG or PNG photo attached to a tweet is displayed on a Kindle:
- Color gradients (sky, skin tones, charts) become blotchy due to crude internal hardware down-sampling.
- High-resolution photos (2048 × 1536, 2–5MB) easily cause out-of-memory tab crashes in the Kindle browser.
- Full color images take longer to transmit over slow e-reader Wi-Fi.

### 2. Dithering Algorithms
1. **Floyd-Steinberg Error Diffusion**:
   - Spreads the quantization error of a pixel to its neighboring pixels.
   - Preserves photographic detail and sharp line edges, rendering text in charts and screenshots with high legibility.
2. **Ordered Dithering (Bayer Matrix)**:
   - Uses a threshold matrix; fast and produces a distinctive retro print texture.
3. **High-Contrast CSS Pre-Filter (Client-Side)**:
   If preprocessing on a server is avoided, client-side CSS filters provide an instant software approximation:
   ```css
   img.eink-media {
     filter: grayscale(100%) contrast(130%) brightness(95%);
     image-rendering: -webkit-optimize-contrast;
     max-width: 100%;
     max-height: 45vh;
     border: 2px solid #000;
   }
   ```

### 3. Progressive Image Loading / On-Demand Toggle
Because image rendering is the heaviest operation on Kindle e-ink hardware:
- By default, tweet cards should display tweet text and a clean `[📷 View Image]` button.
- Tapping the button loads the image, ensuring that the primary text reading flow remains instantaneous and lightweight.

## Related
- [[e-ink-typography-and-contrast]]
- [[e-ink-refresh-mechanics]]
- [[cloudflare-worker-serverless-architecture]]
- [[local-lan-companion-architecture]]

## Sources
- raw/e-ink-ui-ux-design-patterns.md
- raw/kindle-hardware-and-browser-specs.md
