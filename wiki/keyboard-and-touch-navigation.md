# Keyboard and Touch Navigation

## Summary
Keyboard and touch navigation patterns establish the ergonomic interaction architecture for Kindle devices. They bridge the gap between capacitive touch digitizers, physical hardware page-turn buttons (Kindle Oasis), and external Bluetooth page-turn remotes.

## Details

### 1. Unified Interaction Map
To enable frictionless reading without screen hunting:

| Device Interaction | Action | Target Method |
| :--- | :--- | :--- |
| **Tap Left 30% of Screen** | Previous Tweet | `deck.prev()` |
| **Tap Right 70% of Screen** | Next Tweet | `deck.next()` |
| **Tap Top 10% Header** | Open Settings / Search Drawer | `ui.toggleMenu()` |
| **Hardware Key: ArrowRight / PageDown** | Next Tweet | `deck.next()` |
| **Hardware Key: ArrowLeft / PageUp** | Previous Tweet | `deck.prev()` |
| **Hardware Key: Space / 'j' / 'l'** | Next Tweet | `deck.next()` |
| **Hardware Key: 'k' / 'h'** | Previous Tweet | `deck.prev()` |
| **Swipe Left / Right** | Next / Prev Page | `deck.next() / deck.prev()` |

### 2. Implementation Pattern
```javascript
// Global key listener for Oasis buttons and keyboards
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
    case 'j':
      e.preventDefault();
      deck.next();
      break;
    case 'ArrowLeft':
    case 'PageUp':
    case 'k':
      e.preventDefault();
      deck.prev();
      break;
    case 'Home':
      deck.goTo(0);
      break;
  }
});

// Touch zones overlay
const touchArea = document.getElementById('touch-deck');
touchArea.addEventListener('click', (e) => {
  const width = window.innerWidth;
  const clickX = e.clientX;
  
  if (clickX < width * 0.3) {
    deck.prev();
  } else {
    deck.next();
  }
});
```

### 3. Avoiding Click Delay on Mobile WebKit
On older WebKit browsers, mobile browsers introduce a 300ms tap delay to wait for potential double-taps:
- Setting `touch-action: manipulation;` on interactive containers and body elements eliminates this delay, ensuring immediate response to touch.

## Related
- [[zero-scroll-deck-pagination]]
- [[kindle-browser-runtime]]
- [[e-ink-refresh-mechanics]]

## Sources
- raw/e-ink-ui-ux-design-patterns.md
- raw/kindle-hardware-and-browser-specs.md
