const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const pageScript = path.resolve(__dirname, '../../dagongren-tizhi-widget/pages/index/index.js');

function loadPage({ storedResult = null } = {}) {
  const pageDefinitions = [];
  const toasts = [];
  let savedResult = null;

  global.Page = (definition) => pageDefinitions.push(definition);
  global.xhs = {
    getStorageSync: () => storedResult,
    setStorageSync: (key, value) => {
      savedResult = { key, value };
    },
    showToast: (payload) => toasts.push(payload),
  };

  delete require.cache[require.resolve(pageScript)];
  require(pageScript);

  const definition = pageDefinitions.at(-1);
  const instance = {
    data: structuredClone(definition.data),
    setData(updates) {
      this.data = { ...this.data, ...updates };
    },
  };

  return { definition, instance, toasts, getSavedResult: () => savedResult };
}

test('walks the one-page quiz flow and preserves an answer when going back', () => {
  const { definition, instance, toasts } = loadPage();
  definition.onLoad.call(instance);
  definition.startQuiz.call(instance);

  assert.equal(instance.data.mode, 'quiz');
  assert.equal(instance.data.progress, '01 / 07');
  assert.equal(instance.data.isLastQuestion, false);

  definition.nextQuestion.call(instance);
  assert.deepEqual(toasts.at(-1), { title: '先选一个，再继续', icon: 'none' });

  definition.selectOption.call(instance, { currentTarget: { dataset: { index: '2' } } });
  assert.equal(instance.data.optionCClass, 'is-selected');
  assert.equal(instance.data.optionAClass, '');
  definition.nextQuestion.call(instance);
  assert.equal(instance.data.currentIndex, 1);
  assert.equal(instance.data.selectedIndex, -1);

  definition.previousQuestion.call(instance);
  assert.equal(instance.data.currentIndex, 0);
  assert.equal(instance.data.selectedIndex, 2);
  assert.equal(instance.data.answers[0], 'deadline-c');
});

test('does not advance when the visible selection and stored answer disagree', () => {
  const { definition, instance, toasts } = loadPage();
  definition.startQuiz.call(instance);
  instance.data.selectedIndex = 0;

  definition.nextQuestion.call(instance);

  assert.equal(instance.data.currentIndex, 0);
  assert.deepEqual(toasts.at(-1), { title: '先选一个，再继续', icon: 'none' });
});

test('finishes the quiz, persists only the result id, and creates a share payload', () => {
  const { definition, instance, getSavedResult } = loadPage();
  definition.startQuiz.call(instance);

  for (let index = 0; index < instance.data.questions.length; index += 1) {
    instance.data.currentIndex = index;
    instance.data.currentQuestion = instance.data.questions[index];
    instance.data.selectedIndex = 0;
    instance.data.answers[index] = instance.data.questions[index].options[0].id;
  }

  definition.nextQuestion.call(instance);
  const saved = getSavedResult();
  const share = definition.onShareAppMessage.call(instance);

  assert.equal(instance.data.mode, 'result');
  assert.ok(instance.data.result.id);
  assert.deepEqual(saved.value, { id: instance.data.result.id });
  assert.match(share.title, /^我是.+，你是哪种？$/);
  assert.equal(share.path, '/pages/index/index');
  assert.equal(share.query, `type=${instance.data.result.id}`);
});

test('opens a shared result directly when the page receives a valid type query', () => {
  const { definition, instance } = loadPage();
  definition.onLoad.call(instance, { type: 'cake-immune' });

  assert.equal(instance.data.mode, 'result');
  assert.equal(instance.data.isResult, true);
  assert.equal(instance.data.result.id, 'cake-immune');
});

test('ignores a malformed last-result cache instead of rendering a blank result', () => {
  const { definition, instance } = loadPage({ storedResult: { id: 'not-a-type' } });
  definition.onLoad.call(instance);

  assert.equal(instance.data.hasLastResult, false);
  assert.equal(instance.data.mode, 'home');
});
