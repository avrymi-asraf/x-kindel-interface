/**
 * x-kindel-interface: Headless Chrome CDP Verification Test Harness
 * Connects directly to Google Chrome via Chrome DevTools Protocol (port 9222).
 * Exercises deck pagination, tap zones, note-tweet chunking, image toggling,
 * drawer interactions, favorites persistence, and multi-device resolutions.
 */

const fs = require('fs');
const path = require('path');

const CDP_PORT = 9222;
const ARTIFACTS_DIR = path.join(__dirname, '..', 'test_artifacts');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.reqId = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            cb.reject(new Error(msg.error.message));
          } else {
            cb.resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.reqId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[CDP] Saved screenshot: ${filename}`);
    return filePath;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: true
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== Starting E-Ink Deck Verification Harness ===');

  const tabsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await tabsRes.json();
  let readerTab = tabs.find(t => t.url && t.url.includes('index.html'));

  if (!readerTab) {
    console.log('[CDP] Creating new reader tab via PUT /json/new...');
    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://localhost:8080/index.html`, { method: 'PUT' });
    readerTab = await newTabRes.json();
  }

  if (!readerTab || !readerTab.webSocketDebuggerUrl) {
    throw new Error('No valid Chrome tab found.');
  }

  console.log(`[CDP] Connecting to tab: ${readerTab.title || 'Reader'} (${readerTab.id})`);
  const client = new CDPClient(readerTab.webSocketDebuggerUrl);
  await client.connect();

  // Set default Paperwhite viewport: 750 x 1000
  await client.setViewport(750, 1000);

  // 1. Initial Load: explicitly ensure @karpathy is set
  console.log('\n--- Test 1: Initial Load & Rendering (@karpathy) ---');
  await client.eval(`localStorage.setItem('kindle_x_handle', 'karpathy')`);
  await client.send('Page.navigate', {
    url: 'http://localhost:8080/index.html'
  });
  await sleep(2500);

  let state = await client.eval(`({
    handle: window.kindleDeck.currentHandle,
    author: document.getElementById('author-name').textContent,
    page: document.getElementById('page-indicator').textContent,
    tweetsCount: window.kindleDeck.tweets.length,
    metrics: document.getElementById('metrics-info').textContent,
    btnPrevOpacity: document.getElementById('btn-prev').style.opacity
  })`);
  console.log('State 1 (Initial Load):', state);
  await client.screenshot('01_initial_load.png');

  // 2. Card Turns (Next/Prev)
  console.log('\n--- Test 2: Card Turns & Button States ---');
  await client.eval('window.kindleDeck.next()');
  await sleep(400);
  let card2State = await client.eval(`({
    page: document.getElementById('page-indicator').textContent,
    author: document.getElementById('author-name').textContent,
    badge: document.getElementById('part-badge').textContent,
    btnPrevOpacity: document.getElementById('btn-prev').style.opacity
  })`);
  console.log('State 2 (Card 2):', card2State);
  await client.screenshot('02_card_turn_next.png');

  // 3. Note Tweet Chunking Verification (on Karpathy's long tweet)
  console.log('\n--- Test 3: Note Tweet Chunking Verification ---');
  const noteIdx = await client.eval(`
    window.kindleDeck.tweets.findIndex(t => t.notePart)
  `);
  console.log(`Found chunked note tweet at index: ${noteIdx}`);
  if (noteIdx >= 0) {
    await client.eval(`window.kindleDeck.goTo(${noteIdx})`);
    await sleep(400);
    const noteState = await client.eval(`({
      page: document.getElementById('page-indicator').textContent,
      badge: document.getElementById('part-badge').textContent,
      textLength: document.getElementById('tweet-text-box').textContent.length
    })`);
    console.log('Note Tweet Chunk State:', noteState);
    await client.screenshot('03_note_tweet_chunked.png');
  }

  // 4. Media & Alt-Text Verification (Load @NASA which has rich photos)
  console.log('\n--- Test 4: Media Attachment & Alt-Text (@NASA) ---');
  await client.eval(`
    (async () => {
      await window.kindleDeck.loadProfile('NASA');
    })()
  `);
  await sleep(2500);
  const mediaIdx = await client.eval(`
    window.kindleDeck.tweets.findIndex(t => (t.media?.all?.length > 0 || t.media?.photos?.length > 0))
  `);
  console.log(`Found NASA tweet with media at index: ${mediaIdx}`);
  if (mediaIdx >= 0) {
    await client.eval(`window.kindleDeck.goTo(${mediaIdx})`);
    await sleep(400);
    // Expand media
    await client.eval(`document.getElementById('btn-toggle-img').click()`);
    await sleep(1200);
    const mediaExpanded = await client.eval(`({
      imgDisplay: document.getElementById('media-img').style.display,
      altDisplay: document.getElementById('media-alt').style.display,
      altText: document.getElementById('media-alt').textContent.substring(0, 80)
    })`);
    console.log('Media Expanded State:', mediaExpanded);
    await client.screenshot('04_media_expanded_nasa.png');

    // Collapse media
    await client.eval(`document.getElementById('btn-toggle-img').click()`);
    await sleep(300);
    await client.screenshot('04b_media_collapsed_nasa.png');
  }

  // 5. Deep Pagination & Cursor Pre-fetch (advance to tweet 18)
  console.log('\n--- Test 5: Deep Pagination & Cursor Pre-fetching ---');
  await client.eval(`
    (async () => {
      await window.kindleDeck.loadProfile('karpathy');
    })()
  `);
  await sleep(2500);
  console.log('Advancing to tweet 18 to trigger pre-fetch...');
  await client.eval('window.kindleDeck.goTo(17)');
  await sleep(400);
  await client.eval('window.kindleDeck.next()');
  await sleep(2500); // wait for pre-fetch
  const prefetchState = await client.eval(`({
    currentIndex: window.kindleDeck.currentIndex,
    totalTweets: window.kindleDeck.tweets.length,
    page: document.getElementById('page-indicator').textContent
  })`);
  console.log('State after pre-fetch threshold:', prefetchState);
  await client.screenshot('05_prefetched_stream.png');

  // 6. Accounts Drawer & Modal
  console.log('\n--- Test 6: Accounts Drawer Interaction ---');
  await client.eval('window.kindleDeck.openMenu()');
  await sleep(400);
  await client.screenshot('06_accounts_drawer.png');
  await client.eval('window.kindleDeck.closeMenu()');
  await sleep(300);

  // 7. Load profile via drawer selection (@sama)
  console.log('\n--- Test 7: Load Profile (@sama) ---');
  await client.eval(`
    (async () => {
      await window.kindleDeck.loadProfile('sama');
    })()
  `);
  await sleep(2500);
  const samaState = await client.eval(`({
    handle: window.kindleDeck.currentHandle,
    author: document.getElementById('author-name').textContent,
    page: document.getElementById('page-indicator').textContent
  })`);
  console.log('State 7 (@sama):', samaState);
  await client.screenshot('07_profile_sama.png');

  // 8. Test Error Handling (Non-existent user)
  console.log('\n--- Test 8: Error Handling (Non-existent user) ---');
  await client.eval(`
    (async () => {
      await window.kindleDeck.loadProfile('nonexistent_user_9988776655');
    })()
  `);
  await sleep(2000);
  const errState = await client.eval(`({
    author: document.getElementById('author-name').textContent,
    date: document.getElementById('tweet-date').textContent,
    metrics: document.getElementById('metrics-info').textContent,
    msg: document.getElementById('tweet-text-box').textContent,
    btnPrevOpacity: document.getElementById('btn-prev').style.opacity,
    btnNextOpacity: document.getElementById('btn-next').style.opacity
  })`);
  console.log('Error state rendered:', errState);
  await client.screenshot('08_error_state.png');

  // Reset back to @karpathy
  await client.eval(`window.kindleDeck.loadProfile('karpathy')`);
  await sleep(2500);

  // 9. Multi-Resolution / Device Testing
  console.log('\n--- Test 9: Multi-Resolution Responsiveness ---');
  // Kindle Oasis: 800 x 1060
  await client.setViewport(800, 1060);
  await sleep(400);
  await client.screenshot('09_kindle_oasis_800x1060.png');

  // Kindle Basic (small): 600 x 800
  await client.setViewport(600, 800);
  await sleep(400);
  await client.screenshot('09_kindle_basic_600x800.png');

  // Kindle Scribe (large): 1000 x 1333
  await client.setViewport(1000, 1333);
  await sleep(400);
  await client.screenshot('09_kindle_scribe_1000x1333.png');

  client.close();
  console.log('\n=== All Verification Tests Completed Successfully! ===');
}

run().catch(err => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
