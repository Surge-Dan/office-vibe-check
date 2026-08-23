(function (root) {
  const STAGE_COUNTS = { anchor: 12, branch: 36, calibration: 4, hidden: 2 };
  const validatedData = new WeakSet();
  const dataIndexes = new WeakMap();

  function assert(condition, message) { if (!condition) throw new Error(message); }
  function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
  function mapById(items) { return Object.fromEntries(items.map((item) => [item.id, item])); }
  function dimensionIds(data) { return data.dimensions.map((dimension) => dimension.id); }

  function validateAssessmentData(data) {
    if (data && validatedData.has(data)) return true;
    assert(data && data.version, '题库版本无效');
    assert(Array.isArray(data.dimensions) && data.dimensions.length === 9, '维度数量必须为 9');
    assert(Array.isArray(data.questions) && data.questions.length === 54, '题目数量必须为 54');
    assert(Array.isArray(data.archetypes) && data.archetypes.length === 22, '体质数量必须为 22');
    const dimensions = new Set(dimensionIds(data));
    assert(dimensions.size === 9, '维度 ID 配置无效');
    const questionIds = new Set();
    const optionIds = new Set();
    const stageCounts = { anchor: 0, branch: 0, calibration: 0, hidden: 0 };
    const coverage = Object.fromEntries(Array.from(dimensions, (id) => [id, 0]));

    data.questions.forEach((question) => {
      assert(question && question.id && !questionIds.has(question.id), '题目 ID 配置无效');
      assert(Object.prototype.hasOwnProperty.call(stageCounts, question.stage), `题目 ${question.id} 阶段无效`);
      assert(dimensions.has(question.focus), `题目 ${question.id} 主维度无效`);
      assert(typeof question.scene === 'string' && question.scene.length >= 12, `题目 ${question.id} 场景过短`);
      assert(Array.isArray(question.options) && question.options.length === 4, `题目 ${question.id} 必须有四个选项`);
      questionIds.add(question.id);
      stageCounts[question.stage] += 1;
      question.options.forEach((option) => {
        assert(option && option.id && !optionIds.has(option.id), `题目 ${question.id} 选项 ID 无效`);
        assert(typeof option.text === 'string' && option.text.length >= 8, `题目 ${question.id} 选项文案过短`);
        const entries = Object.entries(option.weights || {});
        assert(entries.length >= 2 && entries.length <= 4, `题目 ${question.id} 选项权重维度数量无效`);
        entries.forEach(([id, weight]) => {
          assert(dimensions.has(id), `题目 ${question.id} 引用了未知维度`);
          assert(Number.isInteger(weight) && weight >= -2 && weight <= 2 && weight !== 0, `题目 ${question.id} 权重无效`);
        });
        optionIds.add(option.id);
      });
      if (question.stage === 'anchor') {
        const touched = new Set(question.options.flatMap((option) => Object.keys(option.weights)));
        touched.forEach((id) => { coverage[id] += 1; });
      }
    });
    Object.keys(STAGE_COUNTS).forEach((stage) => assert(stageCounts[stage] === STAGE_COUNTS[stage], `${stage} 题目数量无效`));
    Object.keys(coverage).forEach((id) => assert(coverage[id] >= 2, `维度 ${id} 的锚点证据不足`));
    data.dimensions.forEach((dimension) => {
      assert(data.questions.filter((question) => question.stage === 'branch' && question.focus === dimension.id).length === 4, `维度 ${dimension.id} 的分支题必须为 4 道`);
    });
    ['c-boundary-pleasing', 'c-rumination-conflict', 'c-drive-disengage', 'c-upward-politics'].forEach((id) => {
      assert(data.questions.some((question) => question.id === id && question.stage === 'calibration'), `校准题 ${id} 配置无效`);
    });
    ['h-offhours', 'h-mask'].forEach((id) => {
      assert(data.questions.some((question) => question.id === id && question.stage === 'hidden'), `隐藏题 ${id} 配置无效`);
    });

    const archetypeIds = new Set();
    data.archetypes.forEach((type) => {
      assert(type.id && type.code && type.name && !archetypeIds.has(type.id), '体质 ID 配置无效');
      assert(type.verdict && type.overview && type.workMode && type.warning, `体质 ${type.id} 文案不完整`);
      assert(Array.isArray(type.strengths) && type.strengths.length === 3, `体质 ${type.id} 优势不完整`);
      assert(Array.isArray(type.risks) && type.risks.length === 3, `体质 ${type.id} 雷区不完整`);
      assert(Array.isArray(type.actions) && type.actions.length === 3, `体质 ${type.id} 建议不完整`);
      assert(type.shareTitle && type.shareTitle.length <= 20 && type.shareContent && type.shareContent.length <= 1000, `体质 ${type.id} 分享文案无效`);
      assert(Array.isArray(type.signatureDimensions) && type.signatureDimensions.length === 3 && type.signatureDimensions.every((id) => dimensions.has(id)), `体质 ${type.id} 签名维度无效`);
      assert(Number.isInteger(type.minimumEvidence) && type.minimumEvidence >= 2, `体质 ${type.id} 最低证据无效`);
      dimensionIds(data).forEach((id) => assert(Number.isFinite(type.prototype[id]) && type.prototype[id] >= 0 && type.prototype[id] <= 100, `体质 ${type.id} 原型无效`));
      if (type.hidden) assert(type.hiddenRule && questionIds.has(type.hiddenRule.questionId), `隐藏体质 ${type.id} 规则无效`);
      archetypeIds.add(type.id);
    });
    assert(data.archetypes.filter((type) => type.hidden).length === 4, '隐藏体质数量必须为 4');
    validatedData.add(data);
    return true;
  }

  function getDataIndex(data) {
    if (dataIndexes.has(data)) return dataIndexes.get(data);
    const index = {
      questions: mapById(data.questions),
      anchors: data.questions.filter((question) => question.stage === 'anchor'),
      branches: {},
    };
    data.dimensions.forEach((dimension) => {
      index.branches[dimension.id] = data.questions.filter((question) => question.stage === 'branch' && question.focus === dimension.id);
    });
    dataIndexes.set(data, index);
    return index;
  }

  function getQuestion(data, id) { return getDataIndex(data).questions[id]; }
  function getChosenOption(question, answerId) { return question && question.options.find((option) => option.id === answerId); }

  function scoreAnswers(answers, route, data) {
    const ids = dimensionIds(data);
    const chosenSum = Object.fromEntries(ids.map((id) => [id, 0]));
    const minimum = Object.fromEntries(ids.map((id) => [id, 0]));
    const maximum = Object.fromEntries(ids.map((id) => [id, 0]));
    const evidence = Object.fromEntries(ids.map((id) => [id, 0]));
    const direction = Object.fromEntries(ids.map((id) => [id, []]));

    route.forEach((questionId) => {
      const question = getQuestion(data, questionId);
      const chosen = getChosenOption(question, answers[questionId]);
      assert(chosen, `答案 ${questionId} 不完整或无效`);
      ids.forEach((id) => {
        const values = question.options.map((option) => option.weights[id] || 0);
        const min = Math.min.apply(null, values);
        const max = Math.max.apply(null, values);
        if (min !== max) {
          minimum[id] += min;
          maximum[id] += max;
          chosenSum[id] += chosen.weights[id] || 0;
          evidence[id] += 1;
          const value = chosen.weights[id] || 0;
          if (value) direction[id].push(value);
        }
      });
    });

    const scores = {};
    const confidence = {};
    ids.forEach((id) => {
      const span = maximum[id] - minimum[id];
      scores[id] = span > 0 ? clamp(Math.round(((chosenSum[id] - minimum[id]) / span) * 100), 0, 100) : 50;
      const signs = direction[id];
      const positives = signs.filter((value) => value > 0).length;
      const negatives = signs.filter((value) => value < 0).length;
      const consistency = signs.length ? Math.max(positives, negatives) / signs.length : 0;
      confidence[id] = Number(clamp(Math.min(1, evidence[id] / 6) * (0.65 + (0.35 * consistency)), 0.1, 1).toFixed(3));
    });
    return { scores, confidence, evidence, direction };
  }

  function hashAnswers(answers, orderedIds) {
    let hash = 2166136261;
    orderedIds.forEach((id) => {
      const text = `${id}:${answers[id] || ''}`;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
    });
    return hash >>> 0;
  }

  function hasHardContradiction(direction) {
    return direction.some((value) => value === 2) && direction.some((value) => value === -2) && direction.length >= 3;
  }

  function selectTargetDimensions(anchorAnswers, data) {
    const anchors = getDataIndex(data).anchors;
    anchors.forEach((question) => assert(getChosenOption(question, anchorAnswers[question.id]), '请先完成全部基础画像题'));
    const scored = scoreAnswers(anchorAnswers, anchors.map((question) => question.id), data);
    const byDeviation = data.dimensions.slice().sort((left, right) => (
      Math.abs(scored.scores[right.id] - 50) - Math.abs(scored.scores[left.id] - 50)
      || left.id.localeCompare(right.id)
    ));
    const prominent = byDeviation.slice(0, 2);
    const used = new Set(prominent.map((dimension) => dimension.id));
    const calibrationNeed = data.dimensions.filter((dimension) => !used.has(dimension.id)).sort((left, right) => {
      const conflict = Number(hasHardContradiction(scored.direction[right.id])) - Number(hasHardContradiction(scored.direction[left.id]));
      if (conflict) return conflict;
      const evidence = scored.evidence[left.id] - scored.evidence[right.id];
      if (evidence) return evidence;
      const confidence = scored.confidence[left.id] - scored.confidence[right.id];
      if (confidence) return confidence;
      return Math.abs(scored.scores[right.id] - 50) - Math.abs(scored.scores[left.id] - 50) || left.id.localeCompare(right.id);
    })[0];
    return prominent.concat(calibrationNeed).map((dimension) => dimension.id);
  }

  function buildAdaptiveRoute(anchorAnswers, data) {
    validateAssessmentData(data);
    const dataIndex = getDataIndex(data);
    const anchors = dataIndex.anchors;
    anchors.forEach((question) => assert(getChosenOption(question, anchorAnswers[question.id]), '请先完成全部基础画像题'));
    const anchorIds = anchors.map((question) => question.id);
    const scored = scoreAnswers(anchorAnswers, anchorIds, data);
    const selectedDimensions = selectTargetDimensions(anchorAnswers, data);
    const answerHash = hashAnswers(anchorAnswers, anchorIds);
    const branches = [];
    selectedDimensions.forEach((id, dimensionIndex) => {
      const pool = dataIndex.branches[id];
      const start = (answerHash + (dimensionIndex * 3)) % pool.length;
      branches.push(pool[start].id, pool[(start + 2) % pool.length].id);
    });

    const calibrationMap = [
      { id: 'c-boundary-pleasing', dimensions: ['boundary', 'pleasing'] },
      { id: 'c-rumination-conflict', dimensions: ['rumination', 'conflict'] },
      { id: 'c-drive-disengage', dimensions: ['drive', 'disengage'] },
      { id: 'c-upward-politics', dimensions: ['upward', 'politics'] },
    ];
    const calibrations = calibrationMap.filter((rule) => rule.dimensions.some((id) => hasHardContradiction(scored.direction[id])))
      .sort((left, right) => {
        const leftNeed = Math.min.apply(null, left.dimensions.map((id) => scored.confidence[id]));
        const rightNeed = Math.min.apply(null, right.dimensions.map((id) => scored.confidence[id]));
        return leftNeed - rightNeed || left.id.localeCompare(right.id);
      }).slice(0, 2).map((rule) => rule.id);

    const hidden = [];
    const score = scored.scores;
    if ((score.boundary >= 68 && score.pleasing <= 42) || (score.drive >= 72 && score.pleasing >= 64)) hidden.push('h-offhours');
    else if (score.politics >= 65 && (score.conflict <= 45 || score.boundary >= 60)) hidden.push('h-mask');
    return anchorIds.concat(branches, calibrations, hidden);
  }

  function hiddenMatch(answers, scores, type) {
    const rule = type.hiddenRule;
    if (!rule || !rule.optionIds.includes(answers[rule.questionId])) return false;
    return Object.entries(rule.ranges || {}).every(([id, range]) => scores[id] >= range[0] && scores[id] <= range[1]);
  }

  function distanceTo(scores, confidence, type, ids) {
    let weighted = 0;
    let totalWeight = 0;
    ids.forEach((id) => {
      const weight = confidence[id] || 0.1;
      weighted += weight * ((scores[id] - type.prototype[id]) ** 2);
      totalWeight += weight;
    });
    return Math.sqrt(weighted / totalWeight);
  }

  function matchArchetype(scores, confidence, answers, data, evidence) {
    const ids = dimensionIds(data);
    const evidenceMap = evidence || Object.fromEntries(ids.map((id) => [id, 99]));
    const regular = data.archetypes.filter((type) => !type.hidden).map((type, index) => ({
      type,
      index,
      distance: distanceTo(scores, confidence, type, ids),
      signatureDistance: type.signatureDimensions.reduce((total, id) => total + Math.abs(scores[id] - type.prototype[id]), 0),
      branchEvidence: type.signatureDimensions.reduce((total, id) => total + (evidenceMap[id] || 0), 0),
      evidenceSatisfied: type.signatureDimensions.every((id) => (evidenceMap[id] || 0) >= type.minimumEvidence),
    })).sort((left, right) => left.distance - right.distance || left.index - right.index);
    regular.sort((left, right) => (
      Number(right.evidenceSatisfied) - Number(left.evidenceSatisfied)
      || left.distance - right.distance
      || left.signatureDistance - right.signatureDistance
      || right.branchEvidence - left.branchEvidence
      || left.index - right.index
    ));
    const hidden = data.archetypes.filter((type) => type.hidden && hiddenMatch(answers, scores, type));
    return { primary: hidden[0] || regular[0].type, secondary: regular.find((entry) => entry.type.id !== (hidden[0] || regular[0].type).id).type };
  }

  function createSubtype(scores, data, primary) {
    const candidates = data.dimensions.filter((dimension) => !primary.signatureDimensions.includes(dimension.id));
    const dimension = candidates.sort((left, right) => Math.abs(scores[right.id] - 50) - Math.abs(scores[left.id] - 50) || left.id.localeCompare(right.id))[0];
    const poles = {
      drive: ['节能', '加码'], rumination: ['钝感', '高敏'], boundary: ['弹性', '边界'], upward: ['潜行', '表达'],
      disengage: ['硬扛', '止损'], execution: ['游走', '闭环'], pleasing: ['自持', '迎合'], conflict: ['缓冲', '摊牌'], politics: ['佛系', '雷达'],
    };
    return `${poles[dimension.id][scores[dimension.id] >= 50 ? 1 : 0]}特化型`;
  }

  function createReport(answers, route, data) {
    validateAssessmentData(data);
    assert(Array.isArray(route) && route.length >= 18 && route.length <= 21 && new Set(route).size === route.length, '动态路径无效');
    const scored = scoreAnswers(answers, route, data);
    const matched = matchArchetype(scored.scores, scored.confidence, answers, data, scored.evidence);
    const primary = matched.primary;
    const dimensions = data.dimensions.map((dimension) => ({
      id: dimension.id,
      name: dimension.name,
      score: scored.scores[dimension.id],
      confidence: scored.confidence[dimension.id],
      pole: scored.scores[dimension.id] >= 50 ? dimension.high : dimension.low,
      explanation: scored.scores[dimension.id] >= 50 ? dimension.tipHigh : dimension.tipLow,
      color: dimension.color,
    }));
    const signature = hashAnswers(answers, route).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
    return {
      version: data.version,
      signature,
      completedAt: new Date(0).toISOString(),
      routeLength: route.length,
      primaryId: primary.id,
      secondaryId: matched.secondary.id,
      code: primary.code,
      name: primary.name,
      subtype: createSubtype(scored.scores, data, primary),
      verdict: primary.verdict,
      overview: primary.overview,
      strengths: primary.strengths.slice(),
      risks: primary.risks.slice(),
      actions: primary.actions.slice(),
      workMode: primary.workMode,
      warning: primary.warning,
      secondary: {
        id: matched.secondary.id,
        name: matched.secondary.name,
        differences: data.dimensions.map((dimension) => ({
          id: dimension.id,
          name: dimension.name,
          primary: primary.prototype[dimension.id],
          secondary: matched.secondary.prototype[dimension.id],
          gap: Math.abs(primary.prototype[dimension.id] - matched.secondary.prototype[dimension.id]),
        })).sort((left, right) => right.gap - left.gap || left.id.localeCompare(right.id)).slice(0, 2),
      },
      scores: scored.scores,
      confidence: scored.confidence,
      dimensions,
      shareTitle: primary.shareTitle,
      shareContent: primary.shareContent,
    };
  }

  function rebuildAfterAnchorEdit(answers, previousRoute, data) {
    const anchorIds = data.questions.filter((question) => question.stage === 'anchor').map((question) => question.id);
    const kept = {};
    anchorIds.forEach((id) => { if (answers[id]) kept[id] = answers[id]; });
    return { answers: kept, route: buildAdaptiveRoute(kept, data), previousRoute: previousRoute.slice() };
  }

  function isValidSessionSnapshot(session, data) {
    try {
      if (!session || session.version !== data.version || !Number.isInteger(session.index) || !Array.isArray(session.route) || !session.answers || typeof session.answers !== 'object') return false;
      if (![12, 18, 19, 20, 21].includes(session.route.length) || session.index < 0 || session.index >= session.route.length || new Set(session.route).size !== session.route.length) return false;
      const anchors = getDataIndex(data).anchors.map((question) => question.id);
      if (session.route.slice(0, 12).join('|') !== anchors.join('|')) return false;
      if (!session.route.every((id) => getQuestion(data, id))) return false;
      if (!Object.entries(session.answers).every(([id, answer]) => session.route.includes(id) && getChosenOption(getQuestion(data, id), answer))) return false;
      for (let index = 0; index < session.index; index += 1) if (!session.answers[session.route[index]]) return false;
      if (session.route.length > 12) {
        if (!anchors.every((id) => session.answers[id])) return false;
        if (buildAdaptiveRoute(session.answers, data).join('|') !== session.route.join('|')) return false;
      }
      return true;
    } catch (error) { return false; }
  }

  function isValidReportSnapshot(report, data) {
    try {
      if (!report || report.version !== data.version || !data.archetypes.some((type) => type.id === report.primaryId)) return false;
      if (!report.secondary || !data.archetypes.some((type) => type.id === report.secondary.id) || !Array.isArray(report.secondary.differences) || report.secondary.differences.length !== 2) return false;
      if (!Array.isArray(report.dimensions) || report.dimensions.length !== 9 || !report.scores || !report.confidence) return false;
      if (!data.dimensions.every((dimension) => Number.isFinite(report.scores[dimension.id]) && report.scores[dimension.id] >= 0 && report.scores[dimension.id] <= 100 && Number.isFinite(report.confidence[dimension.id]) && report.confidence[dimension.id] > 0 && report.confidence[dimension.id] <= 1)) return false;
      const reportDimensionIds = report.dimensions.map((dimension) => dimension.id);
      if (new Set(reportDimensionIds).size !== 9 || !data.dimensions.every((dimension) => reportDimensionIds.includes(dimension.id))) return false;
      if (!report.dimensions.every((dimension) => Number.isFinite(dimension.score) && dimension.score >= 0 && dimension.score <= 100 && typeof dimension.name === 'string' && typeof dimension.explanation === 'string')) return false;
      const differenceIds = report.secondary.differences.map((difference) => difference.id);
      if (new Set(differenceIds).size !== 2 || !report.secondary.differences.every((difference) => data.dimensions.some((dimension) => dimension.id === difference.id) && typeof difference.name === 'string' && Number.isFinite(difference.primary) && Number.isFinite(difference.secondary) && Number.isFinite(difference.gap) && difference.gap === Math.abs(difference.primary - difference.secondary))) return false;
      if (!Array.isArray(report.strengths) || report.strengths.length !== 3 || !Array.isArray(report.risks) || report.risks.length !== 3 || !Array.isArray(report.actions) || report.actions.length !== 3) return false;
      return Boolean(report.name && report.code && report.subtype && report.verdict && report.overview && report.workMode && report.warning);
    } catch (error) { return false; }
  }

  function formatProgress(index, total) {
    assert(Number.isInteger(index) && Number.isInteger(total) && index >= 0 && index < total, '题目进度无效');
    return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  root.DagongrenAssessmentEngine = {
    buildAdaptiveRoute,
    createReport,
    formatProgress,
    isValidReportSnapshot,
    isValidSessionSnapshot,
    matchArchetype,
    rebuildAfterAnchorEdit,
    scoreAnswers,
    selectTargetDimensions,
    validateAssessmentData,
  };
})(typeof window !== 'undefined' ? window : globalThis);
