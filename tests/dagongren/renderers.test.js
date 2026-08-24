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

test('renders animal stamps with layered hand-drawn texture', () => {
  const animals = load('animals.js').DagongrenAnimals;
  const calls = [];
  const context = new Proxy({}, {
    get(target, property) {
      if (property === 'createLinearGradient') return (...args) => { calls.push([property, args]); return { addColorStop: () => {} }; };
      if (property === 'createRadialGradient') return (...args) => { calls.push([property, args]); return { addColorStop: () => {} }; };
      return (...args) => { calls.push([property, args]); };
    },
    set(target, property, value) { calls.push([property, [value]]); target[property] = value; return true; },
  });
  animals.drawStamp(context, 'MEERKAT', 105, 105, 180, '#E8513D', '#F3F0E8');
  assert.ok(calls.some(([name]) => name === 'bezierCurveTo'));
  assert.ok(calls.some(([name]) => name === 'createLinearGradient'));
  assert.ok(calls.some(([name, args]) => name === 'globalAlpha' && args[0] < 1));
  assert.ok(calls.filter(([name]) => name === 'stroke').length >= 5);
});
