const test = require('node:test');
const assert = require('node:assert/strict');

const questions = require('../../dagongren-tizhi-widget/data/questions.js');
const types = require('../../dagongren-tizhi-widget/data/types.js');
const {
  calculateResult,
  formatProgress,
  validateQuestionBank,
} = require('../../dagongren-tizhi-widget/assets/quiz-core.js');

test('keeps the widget question bank at seven scenario questions with four options each', () => {
  assert.equal(questions.length, 7);
  assert.ok(questions.every((question) => question.options.length === 4));
  assert.equal(new Set(questions.map((question) => question.id)).size, 7);
});

test('validates question and type content before the widget can ship', () => {
  assert.equal(validateQuestionBank(questions, types), true);
});

test('rejects a type that cannot be selected by any answer option', () => {
  const unreachableTypes = types.map((type) => type.id === 'meeting-escape' ? {
    id: 'unreachable',
    name: '无入口体质',
    tags: ['无', '无', '无'],
    summary: '不应该被发布。',
    quote: '没有任何选项能选中我。',
  } : type);
  const questionsWithoutMeetingType = questions.map((question) => ({
    ...question,
    options: question.options.map((option) => {
      const scores = { ...option.scores };
      if (scores['meeting-escape']) {
        scores['low-key-roll'] = (scores['low-key-roll'] || 0) + scores['meeting-escape'];
        delete scores['meeting-escape'];
      }
      return { ...option, scores };
    }),
  }));

  assert.throws(
    () => validateQuestionBank(questionsWithoutMeetingType, unreachableTypes),
    /体质 unreachable 没有对应选项/,
  );
});

test('returns a stable result payload for a complete answer set', () => {
  const answers = questions.map((question) => question.options[0].id);
  const first = calculateResult(answers, questions, types);
  const second = calculateResult(answers, questions, types);

  assert.deepEqual(first, second);
  assert.ok(types.some((type) => type.id === first.id));
  assert.equal(first.tags.length, 3);
  assert.ok(first.name);
  assert.ok(first.quote);
});

test('rejects incomplete or unknown answers instead of silently generating a result', () => {
  assert.throws(
    () => calculateResult(['missing-option'], questions, types),
    /答案不完整或无效/,
  );
});

test('formats the one-page quiz progress for the visible question', () => {
  assert.equal(formatProgress(0, 7), '01 / 07');
  assert.equal(formatProgress(6, 7), '07 / 07');
  assert.throws(() => formatProgress(7, 7), /题目进度无效/);
});
