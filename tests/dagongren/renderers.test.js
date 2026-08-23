const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function load(file) {
  const sandbox = { window: { devicePixelRatio: 1 } };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, `../../dagongren-mini-tool/${file}`), 'utf8'), sandbox, { filename: file });
  return sandbox.window;
}

test('keeps textual reports usable when Canvas 2D is unavailable', () => {
  const animals = load('animals.js').DagongrenAnimals;
  const radar = load('radar-renderer.js').DagongrenRadar;
  const canvas = { clientWidth: 320, getContext: () => null };
  assert.equal(animals.renderCanvas(canvas, 'CAPY', { size: 180 }), false);
  assert.equal(radar.drawRadar(canvas, [{ name: '边界主权', score: 50 }], { width: 320 }), false);
});
