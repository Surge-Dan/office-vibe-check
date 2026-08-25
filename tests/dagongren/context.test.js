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

test('normalizes three-step identity, industry and role context with safe fallbacks', () => {
  const context = load('context.js').DagongrenContext;
  assert.ok(context.identities.length >= 10);
  assert.ok(context.industries.length >= 15);
  assert.ok(context.roles.length >= 36);
  assert.deepEqual({ ...context.normalize({ identityId: 'professional', industryId: 'education', roleId: 'teacher' }) }, {
    identityId: 'professional', industryId: 'education', roleId: 'teacher', roleFamily: 'professional',
  });
  assert.deepEqual({ ...context.normalize({ identityId: 'unknown', industryId: 'unknown', roleId: null }) }, {
    identityId: 'other', industryId: 'other', roleId: 'other-role', roleFamily: 'other',
  });
  assert.ok(context.getRolesFor('sales', 'service').length >= 3);
  assert.ok(context.getRolesFor('student', 'other').some((role) => role.id === 'other-role'));
});

test('keeps default scenes universal while making selected contexts feel specific', () => {
  const context = load('context.js').DagongrenContext;
  const scene = '你要在今天完成一项重要工作，但负责人没有说清标准和截止时间。你会：';
  const general = context.adaptScene(scene, context.normalize(null));
  const education = context.adaptScene(scene, { identityId: 'professional', industryId: 'education', roleId: 'teacher' });
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
  assert.doesNotMatch(text, /项目|需求|上线|研发|接口|产品|迭代|版本|排期|开发|发布/);
});

test('common questions avoid internet-product vocabulary while context questions carry the specialization', () => {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  ['context.js', 'dimensions.js', 'questions.js', 'context-questions.js'].forEach((file) => {
    vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  });
  const questions = sandbox.window.DagongrenAssessmentData.questions;
  const commonText = questions
    .filter((question) => question.stage === 'anchor' || question.stage === 'branch')
    .flatMap((question) => [question.scene, ...question.options.map((option) => option.text)])
    .join('\n');
  assert.doesNotMatch(commonText, /项目|需求|上线|研发|接口|产品|迭代|版本|排期|开发|发布/);
  assert.match(questions.find((question) => question.id === 'rt-nurse-1').scene, /交班|值班|病区|护理/);
  assert.match(questions.find((question) => question.id === 'rt-sales-representative-1').scene, /客户|拜访|拒绝|成交/);
  assert.match(questions.find((question) => question.id === 'i-manufacturing-3').scene, /设备|机器|产线|质量|交接/);
});

test('chooses deterministic transition copy without the old workplace wording', () => {
  const transitions = load('transition-copy.js').DagongrenTransitions;
  const input = { stage: 'anchor', index: 4, focus: 'rumination', context: { identityId: 'other', industryId: 'other', roleId: 'other-role' } };
  const first = transitions.pick(input);
  const same = transitions.pick(input);
  const other = transitions.pick({ ...input, focus: 'boundary' });
  assert.deepEqual(first, same);
  assert.notEqual(first.headline, other.headline);
  assert.doesNotMatch(`${first.headline}${first.detail}`, /工位本能/);
  assert.ok(first.headline && first.detail);
});
