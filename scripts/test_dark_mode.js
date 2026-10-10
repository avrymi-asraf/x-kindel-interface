/**
 * Validation script for Dark Mode on Kindle X Deck Reader
 * Verifies high-contrast e-ink dark mode, DOM classes, computed styles,
 * SafeStorage persistence, keyboard shortcuts, and screenshot visual artifacts.
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

async function run() {
  console.log('[Test] Connecting to Headless Chrome on port', CDP_PORT);
  const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
  const target = await newTabRes.json();
  console.log('[Test] Created new browser tab:', target.id);

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

  // Wait for initial render
  await new Promise(r => setTimeout(r, 2000));

  // Reset dark mode to false initially to test clean transition
  await client.eval('localStorage.removeItem("kindle_x_dark_mode")');
  await client.eval('if (window.kindleDeck && window.kindleDeck.darkMode) { window.kindleDeck.toggleTheme(); }');
  await new Promise(r => setTimeout(r, 300));

  // 1. Initial State Check
  const initialThemeBtnText = await client.eval('document.getElementById("btn-theme").textContent');
  const initialHasDarkModeClass = await client.eval('document.body.classList.contains("dark-mode")');
  const initialBgColor = await client.eval('getComputedStyle(document.body).backgroundColor');
  const initialColor = await client.eval('getComputedStyle(document.body).color');

  console.log('[Test] Initial Theme Button Text:', initialThemeBtnText);
  console.log('[Test] Initial has dark-mode class:', initialHasDarkModeClass);
  console.log('[Test] Initial Body BG:', initialBgColor, 'Text color:', initialColor);

  if (initialThemeBtnText !== 'Dark') throw new Error(`Expected initial theme button text to be "Dark", got "${initialThemeBtnText}"`);
  if (initialHasDarkModeClass) throw new Error('Expected initial state to NOT have dark-mode class');

  await client.screenshot('15_light_mode_deck.png');

  // 2. Toggle to Dark Mode via Button Click
  console.log('[Test] Clicking #btn-theme to toggle dark mode...');
  await client.eval('document.getElementById("btn-theme").click()');
  await new Promise(r => setTimeout(r, 400));

  const darkThemeBtnText = await client.eval('document.getElementById("btn-theme").textContent');
  const darkHasDarkModeClass = await client.eval('document.body.classList.contains("dark-mode")');
  const darkBgColor = await client.eval('getComputedStyle(document.body).backgroundColor');
  const darkColor = await client.eval('getComputedStyle(document.body).color');
  const darkStorageVal = await client.eval('localStorage.getItem("kindle_x_dark_mode")');

  console.log('[Test] Dark Theme Button Text:', darkThemeBtnText);
  console.log('[Test] Dark has dark-mode class:', darkHasDarkModeClass);
  console.log('[Test] Dark Body BG:', darkBgColor, 'Text color:', darkColor);
  console.log('[Test] localStorage kindle_x_dark_mode:', darkStorageVal);

  if (darkThemeBtnText !== 'Light') throw new Error(`Expected theme button text to be "Light" in dark mode, got "${darkThemeBtnText}"`);
  if (!darkHasDarkModeClass) throw new Error('Expected body to have dark-mode class');
  if (darkBgColor !== 'rgb(0, 0, 0)') throw new Error(`Expected dark mode background rgb(0, 0, 0), got ${darkBgColor}`);
  if (darkColor !== 'rgb(255, 255, 255)') throw new Error(`Expected dark mode text color rgb(255, 255, 255), got ${darkColor}`);
  if (darkStorageVal !== 'true') throw new Error(`Expected localStorage to be 'true', got ${darkStorageVal}`);

  await client.screenshot('16_dark_mode_deck.png');

  // 3. Test Drawer / Menu Modal in Dark Mode
  console.log('[Test] Opening Search/Lists drawer in dark mode...');
  await client.eval('document.getElementById("btn-menu").click()');
  await new Promise(r => setTimeout(r, 400));

  const menuBg = await client.eval('getComputedStyle(document.getElementById("menu-modal")).backgroundColor');
  const menuColor = await client.eval('getComputedStyle(document.getElementById("menu-modal")).color');
  console.log('[Test] Menu modal BG:', menuBg, 'Text color:', menuColor);

  if (menuBg !== 'rgb(0, 0, 0)') throw new Error(`Expected menu modal BG rgb(0, 0, 0), got ${menuBg}`);
  if (menuColor !== 'rgb(255, 255, 255)') throw new Error(`Expected menu modal text rgb(255, 255, 255), got ${menuColor}`);

  await client.screenshot('17_dark_mode_drawer.png');

  // Close drawer
  await client.eval('document.getElementById("btn-close-menu").click()');
  await new Promise(r => setTimeout(r, 300));

  // 4. Test Oasis / Keyboard Shortcut 'd' to Toggle Back to Light Mode
  console.log('[Test] Triggering "d" keyboard event to toggle theme back...');
  await client.eval('window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))');
  await new Promise(r => setTimeout(r, 400));

  const toggledBtnText = await client.eval('document.getElementById("btn-theme").textContent');
  const toggledHasDark = await client.eval('document.body.classList.contains("dark-mode")');
  console.log('[Test] After keyboard shortcut "d", button text:', toggledBtnText, 'has dark-mode:', toggledHasDark);

  if (toggledBtnText !== 'Dark' || toggledHasDark) {
    throw new Error('Keyboard shortcut "d" failed to toggle back to light mode');
  }

  // 5. Test Flush Screen in Dark Mode
  console.log('[Test] Toggling back to Dark Mode and testing flushScreen()...');
  await client.eval('window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))');
  await new Promise(r => setTimeout(r, 200));
  await client.eval('kindleDeck.flushScreen()');
  // Wait for 70ms flash to finish
  await new Promise(r => setTimeout(r, 300));
  const postFlushBg = await client.eval('getComputedStyle(document.body).backgroundColor');
  console.log('[Test] Post-flush background color:', postFlushBg);
  if (postFlushBg !== 'rgb(0, 0, 0)') throw new Error(`Expected post-flush BG rgb(0, 0, 0), got ${postFlushBg}`);

  // 6. Test Reload Persistence (Dark mode should remain active after reload)
  console.log('[Test] Testing reload persistence with dark mode active...');
  await client.send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));
  const reloadedHasDark = await client.eval('document.body.classList.contains("dark-mode")');
  const reloadedBtnText = await client.eval('document.getElementById("btn-theme").textContent');
  console.log('[Test] Post-reload has dark-mode:', reloadedHasDark, 'Button text:', reloadedBtnText);

  if (!reloadedHasDark || reloadedBtnText !== 'Light') {
    throw new Error('Dark mode did not persist after reload');
  }
  await client.screenshot('18_dark_mode_persisted_reload.png');

  // Clean up tab
  client.close();
  await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${target.id}`, { method: 'PUT' });
  console.log('[Test] SUCCESS: All Dark Mode tests passed with flying colors!');
}

run().catch(err => {
  console.error('[Test] FAILED:', err);
  process.exit(1);
});
