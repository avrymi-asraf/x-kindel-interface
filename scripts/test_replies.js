/**
 * x-kindel-interface: Replies Reader Integration Test Harness
 * Connects directly to Headless Google Chrome via CDP (port 9222).
 * Exercises reading replies to posts, conversation pagination, hierarchical back navigation,
 * keyboard shortcuts, dark mode compatibility, and error resilience.
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

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== Starting Replies Reader CDP Integration Test ===');
  console.log('[Test] Connecting to Headless Chrome on port', CDP_PORT);

  const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
  const target = await newTabRes.json();
  console.log('[Test] Created browser tab:', target.id);

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  console.log('[Test] CDP WebSocket connected.');

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1072,
    height: 1448,
    deviceScaleFactor: 1,
    mobile: true
  });

  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.html');
  console.log('[Test] Navigating to:', fileUrl);
  await client.send('Page.navigate', { url: fileUrl });

  // 1. Wait for initial feed to load
  console.log('[Test] Waiting for initial feed (@karpathy) to load...');
  let loaded = false;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    const count = await client.eval('window.kindleDeck ? window.kindleDeck.tweets.length : 0');
    if (count > 0) {
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    throw new Error('Timed out waiting for initial feed tweets to load.');
  }

  // Ensure consistent initial light theme state
  await client.eval('localStorage.removeItem("kindle_x_dark_mode")');
  await client.eval('if (window.kindleDeck && window.kindleDeck.darkMode) { window.kindleDeck.toggleTheme(); }');
  await sleep(200);

  const initialAuthor = await client.eval('document.getElementById("author-handle").textContent');
  const initialPage = await client.eval('document.getElementById("page-indicator").textContent');
  const repliesBtnText = await client.eval('document.getElementById("btn-read-replies").textContent');
  const repliesBtnVisible = await client.eval('document.getElementById("actions-box").style.display !== "none"');

  console.log(`[Test] Feed loaded: ${initialAuthor}, page: ${initialPage}, button: "${repliesBtnText}"`);
  if (!repliesBtnVisible) throw new Error('Expected #actions-box to be visible on tweet card');
  if (!repliesBtnText.includes('Read Replies')) throw new Error(`Expected button text to contain "Read Replies", got "${repliesBtnText}"`);

  await client.screenshot('20_feed_with_replies_button.png');

  // 2. Click [💬 Read Replies] to load conversation
  console.log('[Test] Clicking [💬 Read Replies] button...');
  const currentTweetId = await client.eval('window.kindleDeck.tweets[window.kindleDeck.currentIndex].id');
  console.log(`[Test] Loading replies for tweet ID: ${currentTweetId}`);

  await client.eval('document.getElementById("btn-read-replies").click()');

  // Wait for replies to load
  let repliesLoaded = false;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    const inReplies = await client.eval('window.kindleDeck.isRepliesMode');
    const loading = await client.eval('window.kindleDeck.isLoading');
    const replyCount = await client.eval('window.kindleDeck.tweets.length');
    if (inReplies && !loading && replyCount > 0) {
      repliesLoaded = true;
      break;
    }
  }

  if (!repliesLoaded) {
    throw new Error('Timed out waiting for replies to load.');
  }

  const repliesMode = await client.eval('window.kindleDeck.isRepliesMode');
  const backBtnDisplay = await client.eval('document.getElementById("btn-back").style.display');
  const menuBtnDisplay = await client.eval('document.getElementById("btn-menu").style.display');
  const repliesPage = await client.eval('document.getElementById("page-indicator").textContent');
  const replyAuthor = await client.eval('document.getElementById("author-handle").textContent');
  const replyText = await client.eval('document.getElementById("tweet-text-box").textContent');
  const replyBadgeText = await client.eval('document.getElementById("reply-to-badge").textContent');
  const replyBadgeDisplay = await client.eval('document.getElementById("reply-to-badge").style.display');

  console.log(`[Test] In replies mode: ${repliesMode}`);
  console.log(`[Test] Back button display: "${backBtnDisplay}", Menu button: "${menuBtnDisplay}"`);
  console.log(`[Test] Replies page indicator: ${repliesPage}`);
  console.log(`[Test] Reply 1 author: ${replyAuthor}`);
  console.log(`[Test] Replying to badge: "${replyBadgeText}" (display: ${replyBadgeDisplay})`);
  console.log(`[Test] Reply text snippet: "${replyText.substring(0, 60)}..."`);

  if (!repliesMode) throw new Error('Expected isRepliesMode to be true');
  if (backBtnDisplay !== 'inline-block') throw new Error(`Expected #btn-back display inline-block, got "${backBtnDisplay}"`);
  if (menuBtnDisplay !== 'none') throw new Error(`Expected #btn-menu display none, got "${menuBtnDisplay}"`);
  if (replyBadgeDisplay === 'none') throw new Error('Expected #reply-to-badge to be visible');

  await client.screenshot('21_replies_deck_card_1.png');

  // 3. Test discrete pagination through replies deck
  console.log('[Test] Advancing to Reply 2 via Next button...');
  await client.eval('document.getElementById("btn-next").click()');
  await sleep(300);

  const reply2Page = await client.eval('document.getElementById("page-indicator").textContent');
  const reply2Author = await client.eval('document.getElementById("author-handle").textContent');
  console.log(`[Test] Reply 2 page: ${reply2Page}, Author: ${reply2Author}`);

  if (!reply2Page.startsWith('2 /')) throw new Error(`Expected page 2, got "${reply2Page}"`);

  await client.screenshot('22_replies_deck_card_2.png');

  // Return to Reply 1 via Prev button
  console.log('[Test] Returning to Reply 1 via Prev button...');
  await client.eval('document.getElementById("btn-prev").click()');
  await sleep(300);

  const backToReply1Page = await client.eval('document.getElementById("page-indicator").textContent');
  if (!backToReply1Page.startsWith('1 /')) throw new Error(`Expected page 1, got "${backToReply1Page}"`);

  // 4. Test Dark Mode in Replies Deck
  console.log('[Test] Toggling dark mode while reading replies...');
  await client.eval('document.getElementById("btn-theme").click()');
  await sleep(400);

  const darkClassPresent = await client.eval('document.body.classList.contains("dark-mode")');
  const darkBg = await client.eval('getComputedStyle(document.body).backgroundColor');
  console.log(`[Test] Dark mode active: ${darkClassPresent}, BG: ${darkBg}`);
  if (!darkClassPresent || darkBg !== 'rgb(0, 0, 0)') throw new Error('Dark mode did not apply in replies view');

  await client.screenshot('23_replies_deck_dark_mode.png');

  // Toggle back to light mode
  await client.eval('document.getElementById("btn-theme").click()');
  await sleep(300);

  // 5. Test [← Back] to return to original timeline feed
  console.log('[Test] Clicking [← Back] button to return to timeline feed...');
  await client.eval('document.getElementById("btn-back").click()');
  await sleep(400);

  const restoredRepliesMode = await client.eval('window.kindleDeck.isRepliesMode');
  const restoredBackDisplay = await client.eval('document.getElementById("btn-back").style.display');
  const restoredMenuDisplay = await client.eval('document.getElementById("btn-menu").style.display');
  const restoredPage = await client.eval('document.getElementById("page-indicator").textContent');
  const restoredAuthor = await client.eval('document.getElementById("author-handle").textContent');

  console.log(`[Test] Restored mode: isRepliesMode=${restoredRepliesMode}`);
  console.log(`[Test] Restored header buttons: Back="${restoredBackDisplay}", Menu="${restoredMenuDisplay}"`);
  console.log(`[Test] Restored feed position: Author=${restoredAuthor}, Page=${restoredPage}`);

  if (restoredRepliesMode !== false) throw new Error('Expected isRepliesMode to be false after popNavigation');
  if (restoredBackDisplay !== 'none') throw new Error('Expected #btn-back to be hidden after returning to feed');
  if (restoredMenuDisplay !== 'inline-block') throw new Error('Expected #btn-menu to be visible after returning to feed');
  if (restoredAuthor !== initialAuthor) throw new Error(`Expected restored author "${initialAuthor}", got "${restoredAuthor}"`);

  await client.screenshot('24_back_to_feed_restored.png');

  // 6. Test Keyboard Shortcut "r" to open replies and "b" to return
  console.log('[Test] Testing keyboard shortcut "r" to open replies...');
  await client.eval('window.onkeydown({ key: "r", keyCode: 82, preventDefault: function(){} })');

  let kbRepliesLoaded = false;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    const inReplies = await client.eval('window.kindleDeck.isRepliesMode');
    const loading = await client.eval('window.kindleDeck.isLoading');
    if (inReplies && !loading) {
      kbRepliesLoaded = true;
      break;
    }
  }

  if (!kbRepliesLoaded) throw new Error('Failed to open replies via keyboard shortcut "r"');
  console.log('[Test] Successfully opened replies via keyboard shortcut "r"');

  console.log('[Test] Testing keyboard shortcut "b" to return to feed...');
  await client.eval('window.onkeydown({ key: "b", keyCode: 66, preventDefault: function(){} })');
  await sleep(300);

  const kbRestored = await client.eval('window.kindleDeck.isRepliesMode');
  if (kbRestored !== false) throw new Error('Failed to return to feed via keyboard shortcut "b"');
  console.log('[Test] Successfully returned to feed via keyboard shortcut "b"');

  // 7. Cleanup
  client.close();
  console.log('=== All Replies Reader Integration Tests Passed Successfully! ===');
}

run().catch(err => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
