const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../dagongren-mini-tool');
const codes = ['CAPY', 'HEDGE', 'DEER', 'CIVET', 'WOLF', 'PARROT', 'SHIBA', 'OX', 'OTTER', 'MEERKAT', 'CHEETAH', 'ELEPHANT', 'DOLPHIN', 'CAMEL', 'SLOTH', 'LYNX', 'FOX', 'BEE', 'SNOW', 'SHEP', 'QCAT', 'OWL'];

function load() {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'animals.js'), 'utf8'), sandbox, { filename: 'animals.js' });
  return sandbox.window.DagongrenAnimals;
}

function recorder() {
  const fills = [];
  const strokes = [];
  const ctx = {
    fills, strokes, save() {}, restore() {}, translate() {}, rotate() {}, beginPath() {}, closePath() {},
    moveTo() {}, lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, arc() {}, ellipse() {}, rect() {}, fill() { fills.push(ctx.fillStyle); }, stroke() { strokes.push(ctx.strokeStyle); },
    setLineDash() {}, createLinearGradient() { return { addColorStop() {} }; },
  };
  return new Proxy(ctx, { set(target, property, value) { target[property] = value; return true; } });
}

test('renders every animal code as a distinct multi-color filled illustration', () => {
  const animals = load();
  const signatures = new Set();
  codes.forEach((code) => {
    const ctx = recorder();
    animals.drawStamp(ctx, code, 100, 100, 160, '#181815', '#F3F0E8');
    assert.ok(ctx.fills.length >= 8, `${code} should have layered fills`);
    assert.ok(new Set(ctx.fills.filter((value) => typeof value === 'string')).size >= 4, `${code} should use a colorful palette`);
    signatures.add(ctx.fills.filter((value) => typeof value === 'string').join('|'));
  });
  assert.equal(signatures.size, codes.length, 'each result code must have its own illustration palette');
});
