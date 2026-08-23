const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '../../dagongren-mini-tool');
const htmlPath = path.join(projectRoot, 'index.html');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function loadRuntime() {
  const sandbox = { window: {} };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(fs.readFileSync(path.join(projectRoot, 'questions.js'), 'utf8'), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(projectRoot, 'types.js'), 'utf8'), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(projectRoot, 'quiz-core.js'), 'utf8'), sandbox);
  return sandbox.window;
}

test('ships a root index.html with external classic scripts and relative assets', () => {
  const html = readProjectFile('index.html');
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html[^>]+lang=["']zh-CN["']/i);
  assert.match(html, /viewport-fit=cover/i);
  assert.doesNotMatch(html, /user-scalable\s*=|maximum-scale\s*=/i);
  assert.match(html, /class=["']skip-link["']/i);
  assert.match(html, /<main[^>]+id=["']main-content["'][^>]+tabindex=["']-1["']/i);
  assert.match(html, /<link[^>]+href=["']\.\/style\.css["']/i);
  assert.match(html, /<img[^>]+src=["']\.\/tool-icon\.png["']/i);
  assert.match(html, /<script[^>]+src=["']\.\/questions\.js["'][^>]*><\/script>/i);
  assert.match(html, /<script[^>]+src=["']\.\/types\.js["'][^>]*><\/script>/i);
  assert.match(html, /<script[^>]+src=["']\.\/quiz-core\.js["'][^>]*><\/script>/i);
  assert.match(html, /<script[^>]+src=["']\.\/main\.js["'][^>]*><\/script>/i);
  assert.doesNotMatch(html, /<script(?![^>]+src=)[^>]*>/i);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)\s*=/i);
  assert.doesNotMatch(html, /<base\b|<iframe\b|<object\b|target=["']_blank["']/i);
});

test('loads the local question bank and keeps every published type reachable', () => {
  const runtime = loadRuntime();
  const { questions, types } = runtime.DagongrenMiniToolData;
  const { validateQuestionBank, calculateResult } = runtime.DagongrenMiniTool;

  assert.equal(validateQuestionBank(questions, types), true);
  assert.equal(questions.length, 7);
  assert.ok(questions.every((question) => question.options.length === 4));
  assert.equal(types.length, 8);
  assert.ok(types.every((type) => type.copyVariants.length >= 5));

  const winners = new Set();
  for (let encoded = 0; encoded < 4 ** questions.length; encoded += 1) {
    let value = encoded;
    const answers = questions.map((question) => {
      const option = question.options[value % 4];
      value = Math.floor(value / 4);
      return option.id;
    });
    winners.add(calculateResult(answers, questions, types).id);
  }
  assert.deepEqual([...winners].sort(), Array.from(types, (type) => type.id).sort());
});

test('rejects cross-question and sparse answers instead of silently scoring them', () => {
  const runtime = loadRuntime();
  const { questions, types } = runtime.DagongrenMiniToolData;
  const { calculateResult } = runtime.DagongrenMiniTool;
  const validAnswers = questions.map((question) => question.options[0].id);

  assert.throws(() => calculateResult([
    questions[1].options[0].id,
    ...validAnswers.slice(1),
  ], questions, types), /答案/);

  const sparseAnswers = [];
  sparseAnswers.length = questions.length;
  sparseAnswers[0] = validAnswers[0];
  assert.throws(() => calculateResult(sparseAnswers, questions, types), /答案/);
});

test('keeps result copy variants deterministic and safely falls back on invalid indexes', () => {
  const runtime = loadRuntime();
  const { questions, types } = runtime.DagongrenMiniToolData;
  const { calculateResult, getResultVariant } = runtime.DagongrenMiniTool;
  const answers = questions.map((question) => question.options[0].id);
  const first = calculateResult(answers, questions, types);
  const second = calculateResult(answers, questions, types);

  assert.equal(first.id, second.id);
  assert.equal(first.variantIndex, second.variantIndex);
  assert.equal(first.quote, second.quote);
  assert.equal(getResultVariant(first, 999).variantIndex, 0);
  assert.equal(getResultVariant(first, -1).variantIndex, 0);
});

test('keeps the H5 runtime offline and free of forbidden browser capabilities', () => {
  const files = [
    'index.html',
    'main.js',
    'quiz-core.js',
    'style.css',
    'questions.js',
    'types.js',
  ];
  const source = files.map((file) => readProjectFile(file)).join('\n');
  assert.doesNotMatch(source, /https?:\/\//i);
  assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|RTCPeerConnection)\b/);
  assert.doesNotMatch(source, /\b(eval|Function)\s*\(/);
  assert.doesNotMatch(source, /navigator\.(geolocation|clipboard|bluetooth|usb|hid|serial|connection|credentials|locks)/);
  assert.doesNotMatch(source, /new\s+(Worker|SharedWorker|Accelerometer|Gyroscope|Magnetometer)\b/);
  assert.doesNotMatch(source, /window\.open|window\.prompt|requestFullscreen|serviceWorker/);
  assert.doesNotMatch(source, /<iframe|<object|target=["']_blank|\sdownload\s*=/i);
  assert.doesNotMatch(source, /type=["']module["']/i);
  assert.doesNotMatch(source, /\b(import|export)\s+/);
  assert.ok(fs.existsSync(path.join(projectRoot, 'tool-icon.png')));
  assert.match(readProjectFile('style.css'), /overflow-x:\s*hidden/);
});

test('declares the expected one-page UI hooks for the browser flow', () => {
  const html = readProjectFile('index.html');
  const requiredIds = [
    'home-screen',
    'quiz-screen',
    'result-screen',
    'start-button',
    'last-result-button',
    'question-title',
    'option-list',
    'back-button',
    'next-button',
    'progress-label',
    'progress-fill',
    'result-code',
    'result-name',
    'result-quote',
    'result-tags',
    'restart-button',
  ];
  requiredIds.forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
});

test('ships a flat upload zip with only supported static file types', () => {
  const zipPath = path.resolve(__dirname, '../../dagongren-mini-tool.zip');
  assert.ok(fs.existsSync(zipPath), 'run the package builder before the upload audit');
  const entries = execFileSync('tar', ['-tf', zipPath], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  const allowed = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.json']);
  assert.ok(entries.includes('index.html'));
  assert.ok(entries.every((entry) => !entry.includes('/') || !entry.startsWith('dagongren-mini-tool/')));
  assert.ok(entries.every((entry) => allowed.has(path.extname(entry).toLowerCase())));
  assert.ok(!entries.some((entry) => /(^|\/)(node_modules|\.git|__MACOSX)(\/|$)|\.map$|vite\.config\./i.test(entry)));
  assert.ok(fs.statSync(zipPath).size < 10 * 1024 * 1024);
});

test('keeps every upload file directly in the zip root for the Xiaohongshu uploader', () => {
  const zipPath = path.resolve(__dirname, '../../dagongren-mini-tool.zip');
  const entries = execFileSync('tar', ['-tf', zipPath], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);

  assert.ok(entries.every((entry) => !entry.includes('/')), `nested upload path found: ${entries.join(', ')}`);
});
