(function (root, doc) {
  const data = root.DagongrenMiniToolData;
  const core = root.DagongrenMiniTool;
  const STORAGE_KEY = 'dagongren-mini-tool-last-result';
  const state = { mode: 'home', currentIndex: 0, answers: [], selectedIndex: -1, result: null };

  function byId(id) { return doc.getElementById(id); }

  function getStoredResult() {
    try {
      const raw = root.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      const type = data.types.find((item) => item.id === saved.id);
      return type ? core.getResultVariant(type, saved.variantIndex) : null;
    } catch (error) {
      return null;
    }
  }

  function saveResult(result) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: result.id, variantIndex: result.variantIndex }));
    } catch (error) {
      // 本地缓存不可用时，当前测试仍然可以完成。
    }
  }

  function setMessage(text) {
    byId('quiz-message').textContent = text || '';
  }

  function setScreen(screenId) {
    ['home-screen', 'quiz-screen', 'result-screen'].forEach((id) => {
      byId(id).hidden = id !== screenId;
    });
  }

  function renderHome() {
    setScreen('home-screen');
    const hasLastResult = Boolean(getStoredResult());
    byId('last-result-button').hidden = !hasLastResult;
  }

  function renderQuiz() {
    setScreen('quiz-screen');
    const question = data.questions[state.currentIndex];
    const selectedOptionId = state.answers[state.currentIndex] || '';
    state.selectedIndex = question.options.findIndex((option) => option.id === selectedOptionId);
    byId('progress-label').textContent = core.formatProgress(state.currentIndex, data.questions.length);
    byId('progress-fill').style.width = `${core.formatProgressPercent(state.currentIndex, data.questions.length)}%`;
    byId('question-title').textContent = question.title;
    byId('next-button').innerHTML = state.currentIndex === data.questions.length - 1 ? '生成结果 <span aria-hidden="true">↗</span>' : '继续 <span aria-hidden="true">→</span>';
    const list = byId('option-list');
    list.replaceChildren();
    question.options.forEach((option, index) => {
      const button = doc.createElement('button');
      const marker = doc.createElement('span');
      const copy = doc.createElement('span');
      button.type = 'button';
      button.className = 'option-button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(index === state.selectedIndex));
      marker.className = 'option-index';
      marker.textContent = String.fromCharCode(65 + index);
      copy.className = 'option-copy';
      copy.textContent = option.text;
      button.append(marker, copy);
      button.addEventListener('click', () => selectOption(index));
      list.append(button);
    });
  }

  function renderResult() {
    setScreen('result-screen');
    const result = state.result;
    byId('result-code').textContent = `SPECIMEN / ${result.code}`;
    byId('result-name').textContent = result.name;
    byId('result-summary').textContent = result.summary;
    byId('result-quote').textContent = result.quote;
    byId('result-detail').textContent = result.detail;
    byId('result-accent').style.setProperty('--result-color', result.color);
    byId('result-quote').style.setProperty('--result-color', result.color);
    const tags = byId('result-tags');
    tags.replaceChildren();
    result.tags.forEach((tagText) => {
      const tag = doc.createElement('span');
      tag.className = 'tag';
      tag.textContent = tagText;
      tags.append(tag);
    });
  }

  function render() {
    setMessage('');
    if (state.mode === 'quiz') renderQuiz();
    else if (state.mode === 'result') renderResult();
    else renderHome();
  }

  function startQuiz() {
    state.mode = 'quiz';
    state.currentIndex = 0;
    state.answers = [];
    state.selectedIndex = -1;
    state.result = null;
    render();
  }

  function selectOption(index) {
    const question = data.questions[state.currentIndex];
    const option = question.options[index];
    if (!option) return;
    state.answers[state.currentIndex] = option.id;
    state.selectedIndex = index;
    setMessage('');
    renderQuiz();
  }

  function nextQuestion() {
    const question = data.questions[state.currentIndex];
    const selectedOption = question.options[state.selectedIndex];
    if (!selectedOption || state.answers[state.currentIndex] !== selectedOption.id) {
      setMessage('先选一个，再继续。');
      return;
    }
    if (state.currentIndex === data.questions.length - 1) {
      state.result = core.calculateResult(state.answers, data.questions, data.types);
      saveResult(state.result);
      state.mode = 'result';
      render();
      return;
    }
    state.currentIndex += 1;
    renderQuiz();
  }

  function previousQuestion() {
    if (state.currentIndex === 0) {
      state.mode = 'home';
      render();
      return;
    }
    state.currentIndex -= 1;
    renderQuiz();
  }

  function showLastResult() {
    const result = getStoredResult();
    if (!result) return;
    state.result = result;
    state.mode = 'result';
    render();
  }

  function init() {
    core.validateQuestionBank(data.questions, data.types);
    byId('start-button').addEventListener('click', startQuiz);
    byId('last-result-button').addEventListener('click', showLastResult);
    byId('back-button').addEventListener('click', previousQuestion);
    byId('next-button').addEventListener('click', nextQuestion);
    byId('restart-button').addEventListener('click', startQuiz);
    render();
  }

  root.DagongrenMiniToolApp = { init, nextQuestion, previousQuestion, selectOption, startQuiz };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window, document);
