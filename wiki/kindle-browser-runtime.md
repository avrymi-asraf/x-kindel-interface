# Kindle Browser Runtime

## Summary
The Kindle browser runtime represents the execution environment for web applications running on Amazon e-readers. It has undergone a fundamental transition from an obsolete WebKit engine (firmware < 5.16.4) to a lightweight Chromium/Blink engine (firmware 5.16.4+), imposing strict constraints on memory allocation, CPU thread utilization, and TLS certificate validation.

## Details

### 1. Dual-Era Architectural Landscape
The runtime environment differs drastically depending on the device firmware:

- **Legacy WebKit Engine (Firmware < 5.16.4)**:
  - Scored ~152 on HTML5Test.
  - Lacks ES6 syntax (`const`, `let`, arrow functions, Promises, `async/await`, `fetch`).
  - Contains outdated SSL/TLS root certificates. Many modern HTTPS domains (notably those using modern Let's Encrypt certificates) fail with fatal TLS handshake errors.
  - Does not support standard modern CSS Flexbox or CSS Grid.

- **Modern Chromium Engine (Firmware >= 5.16.4)**:
  - Introduced quietly in late 2023 for 10th-generation and newer Kindle devices (Paperwhite 10th/11th Gen, Kindle Basic 10th/11th Gen, Kindle Scribe).
  - Scored ~460+ on HTML5Test.
  - Supports modern ECMAScript standards: `fetch()`, Promises, `async/await`, ES6 classes, CSS Flexbox, and CSS Grid.
  - Supports modern TLS 1.2 and 1.3 certificate chains.

### 2. Physical Hardware & Memory Caps
Regardless of engine version, the underlying hardware on Kindle e-readers is low-power embedded silicon:
- **Processor**: Single or dual-core NXP i.MX6/7 or MediaTek MT8183 clocked at 1.0–2.0 GHz.
- **RAM Constraints**: Physical RAM is typically 512MB to 1GB, but Amazon OS limits the browser process to under 150MB. Heavy SPA bundles (React, Vue, Webpack bundles > 500KB) cause instantaneous OOM (out-of-memory) tab crashes.
- **Execution Threading**: Heavy JavaScript computations block the main browser thread, causing touch events to be dropped and the e-ink screen to freeze.

### 3. Guidelines for Kindle Web Applications
To ensure 100% stability on the Kindle runtime:
1. **Zero External Heavy Bundles**: Use pure vanilla JavaScript without framework runtimes.
2. **Minimal Memory Footprint**: Store state as plain objects; avoid large in-memory caches exceeding 50–100 items.
3. **Viewport Declaration**: Explicitly define `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` to prevent the Kindle from defaulting to a 980px desktop emulation.
4. **Handling Older Devices**: For universal backward compatibility across pre-5.16 devices, serve over unencrypted HTTP via a local network (see [[local-lan-companion-architecture]]), or transpile JS down to ES5 with polyfills.

## Related
- [[e-ink-refresh-mechanics]]
- [[zero-scroll-deck-pagination]]
- [[cors-and-browser-security]]
- [[client-only-static-architecture]]
- [[local-lan-companion-architecture]]

## Sources
- raw/kindle-hardware-and-browser-specs.md
- raw/server-vs-serverless-tradeoffs.md
