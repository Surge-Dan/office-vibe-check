const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../dagongren-mini-tool');

function loadRuntime() {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  ['context.js', 'dimensions.js', 'questions.js', 'archetypes.js', 'assessment-engine.js'].forEach((file) => {
    vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  });
  return sandbox.window;
}

function anchorAnswers(data, optionIndex) {
  return Object.fromEntries(
    data.questions.filter((question) => question.stage === 'anchor')
      .map((question, index) => [question.id, question.options[(optionIndex + index) % 4].id]),
  );
}

test('validates nine dimensions, 54 questions and 22 complete archetypes', () => {
  const runtime = loadRuntime();
  const data = runtime.DagongrenAssessmentData;
  assert.equal(runtime.DagongrenAssessmentEngine.validateAssessmentData(data), true);
  assert.equal(data.dimensions.length, 9);
  assert.equal(data.questions.length, 54);
  assert.deepEqual(
    Object.fromEntries(['anchor', 'branch', 'calibration', 'hidden'].map((stage) => [stage, data.questions.filter((q) => q.stage === stage).length])),
    { anchor: 12, branch: 36, calibration: 4, hidden: 2 },
  );
  assert.equal(data.archetypes.filter((type) => !type.hidden).length, 18);
  assert.equal(data.archetypes.filter((type) => type.hidden).length, 4);
  assert.ok(data.questions.every((question) => question.options.length === 4));
  assert.ok(data.questions.every((question) => question.options.every((option) => {
    const weights = Object.values(option.weights);
    return weights.length >= 2 && weights.length <= 4 && weights.every((value) => Number.isInteger(value) && value >= -2 && value <= 2);
  })));
  assert.ok(data.archetypes.every((type) => (
    type.name && type.verdict && type.overview && type.workMode && type.warning
    && type.signatureDimensions.length === 3 && type.minimumEvidence >= 2
    && type.strengths.length === 3 && type.risks.length === 3 && type.actions.length === 3
  )));
});

test('builds deterministic answer-dependent routes of 18 to 21 unique questions', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const firstAnswers = anchorAnswers(data, 0);
  const secondAnswers = anchorAnswers(data, 2);
  const firstRoute = engine.buildAdaptiveRoute(firstAnswers, data);
  const firstAgain = engine.buildAdaptiveRoute(firstAnswers, data);
  const secondRoute = engine.buildAdaptiveRoute(secondAnswers, data);

  assert.deepEqual(firstRoute, firstAgain);
  assert.notDeepEqual(firstRoute, secondRoute);
  [firstRoute, secondRoute].forEach((route) => {
    assert.ok(route.length >= 18 && route.length <= 21, route.length);
    assert.equal(new Set(route).size, route.length);
    assert.ok(route.slice(0, 12).every((id) => data.questions.find((question) => question.id === id).stage === 'anchor'));
    assert.equal(route.filter((id) => data.questions.find((question) => question.id === id).stage === 'branch').length, 6);
  });
  const targets = engine.selectTargetDimensions(firstAnswers, data);
  const scored = engine.scoreAnswers(firstAnswers, data.questions.filter((question) => question.stage === 'anchor').map((question) => question.id), data);
  const prominent = data.dimensions.slice().sort((left, right) => (
    Math.abs(scored.scores[right.id] - 50) - Math.abs(scored.scores[left.id] - 50) || left.id.localeCompare(right.id)
  )).slice(0, 2).map((dimension) => dimension.id);
  assert.equal(targets.length, 3);
  assert.ok(prominent.every((id) => targets.includes(id)), 'two prominent dimensions must always receive branches');
  assert.equal(new Set(targets).size, 3);
});

test('normalizes every score to 0-100 on the questions actually answered', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const anchors = anchorAnswers(data, 1);
  const route = engine.buildAdaptiveRoute(anchors, data);
  const answers = { ...anchors };
  route.slice(12).forEach((id, index) => {
    const question = data.questions.find((item) => item.id === id);
    answers[id] = question.options[index % 4].id;
  });
  const scored = engine.scoreAnswers(answers, route, data);
  data.dimensions.forEach((dimension) => {
    assert.ok(scored.scores[dimension.id] >= 0 && scored.scores[dimension.id] <= 100);
    assert.ok(scored.evidence[dimension.id] >= 2);
    assert.ok(scored.confidence[dimension.id] > 0 && scored.confidence[dimension.id] <= 1);
  });
});

test('matches every regular archetype at its own prototype and never leaks a hidden type', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const confidence = Object.fromEntries(data.dimensions.map((dimension) => [dimension.id, 1]));
  data.archetypes.filter((type) => !type.hidden).forEach((type) => {
    const result = engine.matchArchetype(type.prototype, confidence, {}, data);
    assert.equal(result.primary.id, type.id);
    assert.equal(result.primary.hidden, false);
    assert.notEqual(result.secondary.id, result.primary.id);
  });
});

test('creates a stable complete report and rebuilds unanswered branches after anchor edits', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const firstAnchors = anchorAnswers(data, 0);
  const firstRoute = engine.buildAdaptiveRoute(firstAnchors, data);
  const answers = { ...firstAnchors };
  firstRoute.slice(12).forEach((id) => {
    const question = data.questions.find((item) => item.id === id);
    answers[id] = question.options[0].id;
  });
  const first = engine.createReport(answers, firstRoute, data);
  const second = engine.createReport(answers, firstRoute, data);
  assert.deepEqual(first, second);
  assert.equal(Object.keys(first.scores).length, 9);
  assert.equal(first.strengths.length, 3);
  assert.equal(first.risks.length, 3);
  assert.equal(first.actions.length, 3);
  assert.ok(first.shareTitle.length <= 20);
  assert.equal(first.secondary.differences.length, 2);
  assert.ok(first.secondary.differences.every((difference) => difference.gap >= 0 && difference.name));

  const changed = { ...answers, [data.questions[0].id]: data.questions[0].options[3].id };
  const rebuilt = engine.rebuildAfterAnchorEdit(changed, firstRoute, data);
  assert.equal(Object.keys(rebuilt.answers).sort().join('|'), firstRoute.slice(0, 12).sort().join('|'));
  assert.deepEqual(rebuilt.route, engine.buildAdaptiveRoute(rebuilt.answers, data));
});

test('keeps selected workplace context in the report and expands its share copy', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const context = { industryId: 'education', roleId: 'research' };
  const answers = anchorAnswers(data, 1);
  const route = engine.buildAdaptiveRoute(answers, data);
  route.slice(12).forEach((id, index) => {
    const question = data.questions.find((item) => item.id === id);
    answers[id] = question.options[index % 4].id;
  });
  const report = engine.createReport(answers, route, data, context);
  assert.deepEqual({ ...report.context }, context);
  assert.match(report.shareContent, /教育|研究/);
  assert.ok(report.shareContent.length > 100);
});

test('rejects corrupted session and report snapshots instead of restoring a broken screen', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const answers = anchorAnswers(data, 0);
  const route = engine.buildAdaptiveRoute(answers, data);
  const validSession = { version: data.version, index: 4, route: route.slice(0, 12), answers };
  assert.equal(engine.isValidSessionSnapshot(validSession, data), true);
  assert.equal(engine.isValidSessionSnapshot({ ...validSession, route: ['a-overtime'] }, data), false);
  assert.equal(engine.isValidSessionSnapshot({ ...validSession, route: route.slice().reverse() }, data), false);
  assert.equal(engine.isValidSessionSnapshot({ ...validSession, answers: { 'a-overtime': 'not-an-option' } }, data), false);

  route.slice(12).forEach((id) => {
    const question = data.questions.find((item) => item.id === id);
    answers[id] = question.options[0].id;
  });
  const report = engine.createReport(answers, route, data);
  assert.equal(engine.isValidReportSnapshot(report, data), true);
  assert.equal(engine.isValidReportSnapshot({ ...report, dimensions: [] }, data), false);
  assert.equal(engine.isValidReportSnapshot({ ...report, strengths: null }, data), false);
  assert.equal(engine.isValidReportSnapshot({ ...report, primaryId: 'missing-type' }, data), false);
  assert.doesNotThrow(() => engine.isValidReportSnapshot({ ...report, dimensions: [null, ...report.dimensions.slice(1)] }, data));
  assert.equal(engine.isValidReportSnapshot({ ...report, dimensions: [null, ...report.dimensions.slice(1)] }, data), false);
  assert.equal(engine.isValidReportSnapshot({ ...report, dimensions: report.dimensions.map(() => report.dimensions[0]) }, data), false);
  assert.doesNotThrow(() => engine.isValidReportSnapshot({ ...report, secondary: { ...report.secondary, differences: [null, report.secondary.differences[1]] } }, data));
  assert.equal(engine.isValidReportSnapshot({ ...report, secondary: { ...report.secondary, differences: [null, report.secondary.differences[1]] } }, data), false);
});

test('survives 100000 deterministic paths without invalid length or score', () => {
  const { DagongrenAssessmentData: data, DagongrenAssessmentEngine: engine } = loadRuntime();
  const anchors = data.questions.filter((question) => question.stage === 'anchor');
  const questionById = new Map(data.questions.map((question) => [question.id, question]));
  const winners = new Set();
  const lengths = new Set();
  const pick = (seed, id) => {
    let hash = Math.imul(seed + 1, 2166136261) >>> 0;
    for (const character of id) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 2246822507);
    hash ^= hash >>> 13;
    return (hash >>> 0) % 4;
  };
  for (let seed = 0; seed < 100000; seed += 1) {
    const answers = {};
    anchors.forEach((question) => {
      answers[question.id] = question.options[pick(seed, question.id)].id;
    });
    const route = engine.buildAdaptiveRoute(answers, data);
    assert.ok(route.length >= 18 && route.length <= 21);
    lengths.add(route.length);
    route.slice(12).forEach((id) => {
      const question = questionById.get(id);
      answers[id] = question.options[pick(seed, id)].id;
    });
    const report = engine.createReport(answers, route, data);
    assert.ok(Object.values(report.scores).every((score) => score >= 0 && score <= 100));
    winners.add(report.primaryId);
  }
  assert.equal(lengths.size, 4, '18、19、20、21 四种路径长度都应实际出现');
  assert.equal(winners.size, 22, '全部 22 种体质都应在确定性模拟中实际可达');
});
