const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../dagongren-tizhi-widget');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('ships one native XHSML page instead of a multi-page mini program', () => {
  const app = JSON.parse(read('app.json'));
  const template = read('pages/index/index.xhsml');
  assert.deepEqual(app.pages, ['pages/index/index']);
  assert.equal(app.window.backgroundTextStyle, 'light');
  assert.ok(fs.existsSync(path.join(root, 'pages/index/index.xhsml')));
  assert.ok(!fs.existsSync(path.join(root, 'pages/quiz')));
  assert.ok(!fs.existsSync(path.join(root, 'pages/result')));
  assert.match(template, /xhs:if=/);
  assert.match(template, /bindtap=/);
  assert.match(template, /open-type="share"/);
  assert.match(template, /hover-class="button-pressed"/);
  assert.match(template, /result\.code/);
  assert.match(template, /result\.color/);
  assert.match(template, /分享我的结果/);
  assert.doesNotMatch(template, /分享这张档案/);
  assert.doesNotMatch(template, /\?/);
  assert.equal(/\bwx:/.test(template), false);
});

test('keeps the upload package to files accepted by the widget toolchain', () => {
  const allowed = new Set(['.js', '.json', '.xhsml', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.cer', '.mp3', '.aac', '.m4a', '.mp4', '.wav', '.ogg', '.silk', '.wasm', '.br']);
  const visit = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? visit(target) : [target];
  });
  const unsupported = visit(root)
    .map((file) => path.extname(file).toLowerCase())
    .filter((extension) => extension && !allowed.has(extension));

  assert.deepEqual(unsupported, []);
});

test('keeps page assets aligned with the one declared page path', () => {
  const app = JSON.parse(read('app.json'));
  const pagePath = app.pages[0];
  assert.equal(fs.existsSync(path.join(root, `${pagePath}.js`)), true);
  assert.equal(fs.existsSync(path.join(root, `${pagePath}.xhsml`)), true);
  assert.equal(fs.existsSync(path.join(root, `${pagePath}.css`)), true);
});

test('keeps runtime code local-only and free of unsupported browser or login dependencies', () => {
  const pageScript = read('pages/index/index.js');
  const forbidden = /\b(fetch|XMLHttpRequest|document|window|localStorage|wx\.|xhs\.request|xhs\.login|xhs\.getUserProfile)\b/;
  assert.equal(forbidden.test(pageScript), false);
  assert.match(pageScript, /Page\(/);
  assert.match(pageScript, /onShareAppMessage/);
});

test('does not assume mini-program-only album or canvas APIs in the widget', () => {
  const pageScript = read('pages/index/index.js');
  const template = read('pages/index/index.xhsml');
  assert.equal(/saveImageToPhotosAlbum|canvasToTempFilePath|createCanvasContext/.test(pageScript), false);
  assert.equal(/canvas-id=|<canvas/.test(template), false);
});

test('keeps the widget package below the two megabyte platform limit', () => {
  const files = [];
  const visit = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else files.push(target);
    });
  };
  visit(root);
  const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  assert.ok(bytes < 2 * 1024 * 1024, `widget package is ${bytes} bytes`);
});
