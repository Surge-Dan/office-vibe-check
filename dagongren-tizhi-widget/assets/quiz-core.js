function validateQuestionBank(questions, types) {
  if (!Array.isArray(questions) || questions.length !== 7) {
    throw new Error('题目数量必须为 7');
  }
  if (!Array.isArray(types) || types.length !== 8) {
    throw new Error('体质数量必须为 8');
  }

  const typeIds = new Set(types.map((type) => type.id));
  const referencedTypeIds = new Set();
  const questionIds = new Set();
  const optionIds = new Set();

  questions.forEach((question) => {
    if (!question || !question.id || questionIds.has(question.id)) {
      throw new Error('题目 ID 配置无效');
    }
    if (!question.title || !Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`题目 ${question.id} 的选项配置无效`);
    }
    questionIds.add(question.id);

    question.options.forEach((option) => {
      if (!option.id || optionIds.has(option.id) || !option.text || !option.scores) {
        throw new Error(`题目 ${question.id} 的选项配置无效`);
      }
      const scoreEntries = Object.entries(option.scores);
      if (!scoreEntries.length || scoreEntries.some(([typeId, score]) => !typeIds.has(typeId) || typeof score !== 'number' || score <= 0)) {
        throw new Error(`题目 ${question.id} 的选项配置无效`);
      }
      scoreEntries.forEach(([typeId]) => referencedTypeIds.add(typeId));
      optionIds.add(option.id);
    });
  });

  types.forEach((type) => {
    if (!type.id || !type.name || !type.summary || !type.quote || !Array.isArray(type.tags) || type.tags.length !== 3) {
      throw new Error(`体质 ${type.id || 'unknown'} 的内容配置无效`);
    }
    if (!referencedTypeIds.has(type.id)) {
      throw new Error(`体质 ${type.id} 没有对应选项`);
    }
  });

  return true;
}

function formatProgress(index, total) {
  if (!Number.isInteger(index) || !Number.isInteger(total) || total <= 0 || index < 0 || index >= total) {
    throw new Error('题目进度无效');
  }
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

function calculateResult(answers, questions, types) {
  validateQuestionBank(questions, types);
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new Error('答案不完整或无效');
  }

  const options = new Map();
  questions.forEach((question) => question.options.forEach((option) => options.set(option.id, option)));
  const totals = Object.fromEntries(types.map((type) => [type.id, 0]));
  const tieBreak = Object.fromEntries(types.map((type) => [type.id, 0]));

  answers.forEach((answerId, index) => {
    const option = options.get(answerId);
    if (!option) throw new Error('答案不完整或无效');
    Object.entries(option.scores).forEach(([typeId, score]) => {
      totals[typeId] += score;
      if (index === answers.length - 1) tieBreak[typeId] += score;
    });
  });

  const order = new Map(types.map((type, index) => [type.id, index]));
  const winner = types
    .slice()
    .sort((a, b) => {
      const totalDiff = totals[b.id] - totals[a.id];
      if (totalDiff) return totalDiff;
      const tieDiff = tieBreak[b.id] - tieBreak[a.id];
      if (tieDiff) return tieDiff;
      return order.get(a.id) - order.get(b.id);
    })[0];

  return {
    ...winner,
    score: totals[winner.id],
  };
}

module.exports = {
  calculateResult,
  formatProgress,
  validateQuestionBank,
};
