# Zero-Scroll Deck Pagination

## Summary
Zero-scroll deck pagination is the core UI pattern for the Kindle X interface. It replaces infinite scrolling timelines with a discrete, paginated deck of cards where each tweet (or discrete page chunk) occupies a fixed viewport, enabling instantaneous single-tap page turns without vertical scroll stutter.

## Details

### 1. The Anti-Pattern: Continuous Infinite Scroll on E-Ink
Modern social media clients (official X, Bluesky, Mastodon) rely on continuous scrolling. On an e-ink display:
- Dragging a finger produces lagged, staggered screen jumps.
- Partial pixel movements create severe ghosting and illegible blurring.
- The user can never rest their eyes while scrolling.
- Reaching a specific tweet boundary is imprecise.

### 2. The "Deck" Architectural Paradigm
The deck pattern treats a collection of tweets like a deck of flashcards or pages in an e-book:
- The browser window is locked to `100vh` and `overflow: hidden`.
- At any point in time, exactly **one tweet card** is rendered into the active viewport slot.
- Advancing forward or backward increments or decrements an internal pointer:
  ```javascript
  let currentIndex = 0;
  let tweets = [];

  function showTweet(index) {
    if (index < 0 || index >= tweets.length) return;
    currentIndex = index;
    const tweet = tweets[currentIndex];
    
    // In-place text mutation triggers fast partial e-ink refresh
    document.getElementById('author-name').textContent = tweet.author.name;
    document.getElementById('author-handle').textContent = '@' + tweet.author.screen_name;
    document.getElementById('tweet-text').textContent = tweet.text;
    document.getElementById('page-indicator').textContent = `${currentIndex + 1} / ${tweets.length}`;
  }
  ```

### 3. Pre-Fetching and Chunk Buffering
To eliminate waiting for network requests during reading:
- The initial load fetches a batch of 20–25 tweets (e.g. from [[fxtwitter-v2-api]]).
- The user reads through tweets 1 to 20 instantaneously from memory.
- When the user reaches index 15 (a threshold of 75%), the system silently issues a background fetch for the next page using the pagination cursor (`cursor.bottom`), appending new tweets to the in-memory array.
- This creates an unbroken, zero-latency reading flow.

### 4. Layout Sizing & Note Tweets
- Standard tweets (<= 280 characters) fit comfortably within a standard Kindle screen at 24px font size.
- Long-form "X Articles" or "Note Tweets" (> 1,000 characters):
  - Rather than scrolling vertically, note tweets should be paginated internally into sub-pages: `Tweet 4 (Part 1/3)`, `Tweet 4 (Part 2/3)`.
  - This strictly preserves the zero-scroll invariant across all content.

## Related
- [[e-ink-refresh-mechanics]]
- [[keyboard-and-touch-navigation]]
- [[e-ink-typography-and-contrast]]
- [[fxtwitter-v2-api]]

## Sources
- raw/todo-requirements.md
- raw/e-ink-ui-ux-design-patterns.md
