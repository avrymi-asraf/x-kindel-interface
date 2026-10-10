# Raw Source: Project Requirements & Vision (TODO.md)

## Source Text
Captured from `/home/avreymi/code/x-kindel-interface/TODO.md`:

```text
what we need is to create a interface for x that will be easy and good for kindel
- easy to move between tweets pages by page, I don't want to scroll list.
- the page need to be sutiable for kindle display, with proper font size and spacing. avoid refreshing part as possible.
- the code need to be clean clear and simple, easy to maintain and extend in the future.
- I prefer to do it without using any runinig server outside, if the only elegent way is by using a server, then we can consider it, but I would like to avoid it if possible.
- example of read x: nitter.cf, 
```

## Core Deconstructed Dimensions

### 1. Kindle Interaction Paradigm
- **Strictly Page-by-Page (Deck Navigation)**:
  - Scrolling continuous lists on e-ink displays is sluggish, disorienting, and physically jarring due to particle motion latency.
  - The interface must behave like an e-reader book: one tweet (or a discrete page of 2-3 tweets) per screen, advancing with discrete taps or key presses.
- **Minimizing Screen Flashes & Repaints**:
  - Full-page URL reloads force the display controller to run a global inversion cycle (black flash -> white -> content).
  - The DOM must update in place without full page refreshes, preserving static controls and swapping only content text nodes.
- **Kindle Display Optimization**:
  - High monochrome contrast (pure `#000000` text on `#FFFFFF` background).
  - Generous padding and margins to accommodate device bezels.
  - Large, readable typography (20px to 26px font scale).
  - Generous touch targets (>48px min tap dimension) for imprecise e-ink touch digitizers.

### 2. Infrastructure & Hosting Preferences
- **Avoid Running External Server if Possible**:
  - The user explicitly requested: "I prefer to do it without using any runinig server outside, if the only elegent way is by using a server, then we can consider it, but I would like to avoid it if possible."
  - Implication: Evaluate pure client-side static architectures (hosted on GitHub Pages / local `file:///` on Kindle), serverless edge zero-maintenance proxies (Cloudflare Workers free tier), and local LAN companion scripts before considering external dedicated servers.

### 3. Twitter / X Source Data Reference
- **Nitter Reference (`nitter.cf`)**:
  - Nitter was the premier open-source front-end for Twitter, featuring no JavaScript, clean HTML, and RSS feeds.
  - However, Nitter faced legal cease-and-desist actions in August 2026 and guest tokens were deprecated by X.
  - Current viable alternatives: FxTwitter / FixEmbed v2 API, Twitter Syndication API, and authenticated local scraping.
