const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../dagongren-mini-tool');

function load(file) {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  return sandbox.window;
}

test('normalizes industry and role context with a safe general fallback', () => {
  const context = load('context.js').DagongrenContext;
  assert.equal(context.industries.length, 9);
  assert.equal(context.roles.length, 7);
  assert.deepEqual({ ...context.normalize({ industryId: 'education', roleId: 'research' }) }, {
    industryId: 'education', roleId: 'research',
  });
  assert.deepEqual({ ...context.normalize({ industryId: 'unknown', roleId: null }) }, {
    industryId: 'general', roleId: 'general',
  });
});

test('keeps default scenes universal while making selected contexts feel specific', () => {
  const context = load('context.js').DagongrenContext;
  const scene = '你要在今天完成一项重要工作，但负责人没有说清标准和截止时间。你会：';
  const general = context.adaptScene(scene, context.normalize(null));
  const education = context.adaptScene(scene, { industryId: 'education', roleId: 'research' });
  assert.equal(general, scene);
  assert.notEqual(education, general);
  assert.match(education, /课程|研究|教学/);
  assert.doesNotMatch(general, /产品经理|研发上线|需求评审|互联网/);
});

test('keeps the shipped default question copy understandable across industries', () => {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  ['context.js', 'dimensions.js', 'questions.js'].forEach((file) => {
    vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  });
  const text = sandbox.window.DagongrenAssessmentData.questions
    .flatMap((question) => [question.scene, ...question.options.map((option) => option.text)]).join('\n');
  assert.doesNotMatch(text, /产品经理|研发上线|需求评审|互联网产品/);
});

test('chooses deterministic transition copy without the old workplace wording', () => {
  const transitions = load('transition-copy.js').DagongrenTransitions;
  const input = { stage: 'anchor', index: 4, focus: 'rumination', context: { industryId: 'general', roleId: 'general' } };
  const first = transitions.pick(input);
  const same = transitions.pick(input);
  const other = transitions.pick({ ...input, focus: 'boundary' });
  assert.deepEqual(first, same);
  assert.notEqual(first.headline, other.headline);
  assert.doesNotMatch(`${first.headline}${first.detail}`, /工位本能/);
  assert.ok(first.headline && first.detail);
});
