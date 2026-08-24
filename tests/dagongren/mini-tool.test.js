const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '../../dagongren-mini-tool');
const expectedFiles = [
  'index.html',
  'style.css',
  'context.js',
  'dimensions.js',
  'questions.js',
  'context-questions.js',
  'archetypes.js',
  'animals.js',
  'assessment-engine.js',
  'transition-copy.js',
  'radar-renderer.js',
  'report-renderer.js',
  'exporter.js',
  'main.js',
  'tool-icon.png',
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('ships the complete flat offline H5 artifact', () => {
  expectedFiles.forEach((file) => assert.ok(fs.existsSync(path.join(projectRoot, file)), `${file} is missing`));
  const html = read('index.html');
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /lang=["']zh-CN["']/i);
  assert.match(html, /width=device-width[^"']*initial-scale=1\.0[^"']*viewport-fit=cover/i);
  assert.match(html, /href=["']\.\/style\.css["']/i);
  expectedFiles.filter((file) => file.endsWith('.js')).forEach((file) => {
    assert.match(html, new RegExp(`<script[^>]+src=["']\\.\\/${file.replace('.', '\\.')}`));
  });
  assert.doesNotMatch(html, /<script(?![^>]+src=)[^>]*>/i);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)\s*=/i);
  assert.doesNotMatch(html, /<base\b|<iframe\b|<object\b|target=["']_blank["']/i);
});

test('declares the adaptive quiz, transition, report and export hooks', () => {
  const html = read('index.html');
  [
    'home-screen', 'quiz-screen', 'transition-screen', 'report-screen', 'export-preview',
    'start-button', 'last-report-button', 'question-title', 'option-list', 'back-button',
    'next-button', 'progress-label', 'progress-fill', 'transition-copy', 'transition-button',
    'animal-stamp', 'result-name', 'result-subtype', 'result-verdict', 'radar-canvas',
    'result-context',
    'dimension-list', 'strength-list', 'risk-list', 'action-list', 'work-mode', 'warning-copy',
    'save-image-button', 'publish-note-button', 'restart-button', 'export-canvas',
  ].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`), `${id} hook is missing`));
  ['identity-options', 'industry-options', 'role-options', 'context-step-indicator', 'context-next-button', 'context-back-button', 'context-skip-button'].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`), `${id} context hook is missing`));
  assert.match(html, /你属于哪种[\s\S]*打工体质？/);
  assert.match(html, /18–21 题动态路径/);
});

test('keeps the runtime offline and within the official capability boundary', () => {
  const source = expectedFiles.filter((file) => /\.(?:html|css|js)$/.test(file)).map(read).join('\n');
  assert.doesNotMatch(source, /https?:\/\//i);
  assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|RTCPeerConnection)\b/);
  assert.doesNotMatch(source, /\b(eval|Function)\s*\(/);
  assert.doesNotMatch(source, /navigator\.(geolocation|clipboard|bluetooth|usb|hid|serial|connection|credentials|locks)/);
  assert.doesNotMatch(source, /new\s+(Worker|SharedWorker|Accelerometer|Gyroscope|Magnetometer)\b/);
  assert.doesNotMatch(source, /window\.open|window\.prompt|requestFullscreen|serviceWorker/);
  assert.doesNotMatch(source, /<iframe|<object|target=["']_blank|\sdownload\s*=/i);
  assert.doesNotMatch(source, /type=["']module["']/i);
  assert.doesNotMatch(source, /\b(import|export)\s+/);
  assert.match(source, /window\.xhs\.miniTool/);
  assert.match(read('style.css'), /prefers-reduced-motion/);
  assert.match(read('style.css'), /--safe-area-inset-top/);
});

test('keeps the icon opaque and the upload zip flat', () => {
  const icon = fs.readFileSync(path.join(projectRoot, 'tool-icon.png'));
  assert.equal(icon.toString('ascii', 1, 4), 'PNG');
  assert.equal(icon[25], 2, 'icon must use opaque RGB PNG color type');

  const zipPath = path.resolve(__dirname, '../../dagongren-mini-tool.zip');
  assert.ok(fs.existsSync(zipPath));
  const entries = execFileSync('tar', ['-tf', zipPath], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  assert.deepEqual(entries.slice().sort(), expectedFiles.slice().sort());
  assert.ok(entries.every((entry) => !entry.includes('/')));
  assert.ok(fs.statSync(zipPath).size < 2 * 1024 * 1024);
});
