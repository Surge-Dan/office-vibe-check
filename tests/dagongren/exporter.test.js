const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadExporter() {
  const sandbox = { window: {}, console };
  vm.runInNewContext(
    fs.readFileSync(path.resolve(__dirname, '../../dagongren-mini-tool/exporter.js'), 'utf8'),
    sandbox,
    { filename: 'exporter.js' },
  );
  return sandbox.window.DagongrenExporter;
}

test('saves a complete data URI through writeTempFile then album bridge', async () => {
  const exporter = loadExporter();
  const calls = [];
  const bridge = {
    writeTempFile: async ({ data }) => { calls.push(['write', data]); return { filePath: 'xhs-temp://report.jpg' }; },
    saveImageToPhotosAlbum: async ({ filePath }) => { calls.push(['save', filePath]); },
  };
  const dataUri = 'data:image/jpeg;base64,AAAA';
  await exporter.saveToAlbum(dataUri, bridge);
  assert.deepEqual(calls, [['write', dataUri], ['save', 'xhs-temp://report.jpg']]);
});

test('publishes a 1-image photo note with bounded title and content', async () => {
  const exporter = loadExporter();
  let payload;
  const bridge = { postNote: async (options) => { payload = options; } };
  await exporter.publishNote('data:image/jpeg;base64,AAAA', {
    name: '高效摸鱼狸猫',
    subtype: '边界特化型',
    verdict: '只把力气花在会留下结果的地方。',
  }, bridge);
  assert.equal(payload.pageType, 'photo_publish');
  assert.ok(payload.title.length <= 20);
  assert.ok(payload.content.length <= 1000);
  assert.equal(payload.mediaInfo.image_resources.length, 1);
  assert.equal(payload.mediaInfo.image_resources[0].url, 'data:image/jpeg;base64,AAAA');
});

test('reports a clear error when the required bridge is unavailable', async () => {
  const exporter = loadExporter();
  await assert.rejects(() => exporter.saveToAlbum('data:image/jpeg;base64,AAAA', null), /小红书 App/);
  await assert.rejects(() => exporter.publishNote('data:image/jpeg;base64,AAAA', {}, {}), /发布能力不可用/);
});

test('propagates every Bridge failure without pretending the image was saved', async () => {
  const exporter = loadExporter();
  const dataUri = 'data:image/jpeg;base64,AAAA';
  let albumCalled = false;
  await assert.rejects(() => exporter.saveToAlbum(dataUri, {
    writeTempFile: async () => { throw new Error('permission denied'); },
    saveImageToPhotosAlbum: async () => { albumCalled = true; },
  }), /permission denied/);
  assert.equal(albumCalled, false);

  await assert.rejects(() => exporter.saveToAlbum(dataUri, {
    writeTempFile: async () => ({ filePath: 'xhs-temp://report.jpg' }),
    saveImageToPhotosAlbum: async () => { throw new Error('album rejected'); },
  }), /album rejected/);

  await assert.rejects(() => exporter.publishNote(dataUri, { name: '测试体质' }, {
    postNote: async () => { throw new Error('postNote failed'); },
  }), /postNote failed/);
});
