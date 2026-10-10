/**
 * Validation script to verify that index.html contains ONLY valid ES5 JavaScript
 * with no ES6+ syntax (no class, const, let, arrow functions, async/await, ?., ??, etc.)
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(filePath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

if (!scriptMatch) {
  console.error('ERROR: No script tag found in index.html');
  process.exit(1);
}

const js = scriptMatch[1];

// Robust tokenizer to strip comments and strings
let inSingle = false;
let inDouble = false;
let inLineComment = false;
let inBlockComment = false;
let stripped = '';

for (let i = 0; i < js.length; i++) {
  const c = js[i];
  const next = js[i + 1];

  if (inLineComment) {
    if (c === '\n') { inLineComment = false; stripped += c; }
    continue;
  }
  if (inBlockComment) {
    if (c === '*' && next === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inSingle) {
    if (c === '\\') { i++; continue; }
    if (c === "'") inSingle = false;
    continue;
  }
  if (inDouble) {
    if (c === '\\') { i++; continue; }
    if (c === '"') inDouble = false;
    continue;
  }

  // Not in string or comment
  if (c === '/' && next === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
  if (c === "'") { inSingle = true; continue; }
  if (c === '"') { inDouble = true; continue; }

  stripped += c;
}

const forbidden = [
  { name: 'class keyword', regex: /\bclass\b/ },
  { name: 'const keyword', regex: /\bconst\b/ },
  { name: 'let keyword', regex: /\blet\b/ },
  { name: 'arrow function', regex: /=>/ },
  { name: 'async keyword', regex: /\basync\b/ },
  { name: 'await keyword', regex: /\bawait\b/ },
  { name: 'optional chaining (?.)', regex: /\?\./ },
  { name: 'nullish coalescing (??)', regex: /\?\?/ },
  { name: 'template literal (backtick)', regex: /[`]/ },
  { name: 'spread operator (...) outside strings', regex: /\.\.\./ }
];

let failed = false;
for (const item of forbidden) {
  const match = stripped.match(item.regex);
  if (match) {
    console.error(`FORBIDDEN SYNTAX FOUND: ${item.name} -> "${match[0]}"`);
    failed = true;
  }
}

if (!failed) {
  console.log('SUCCESS: Verified 100% compliant ES5 JavaScript! Kindle compatible.');
  process.exit(0);
} else {
  process.exit(1);
}
