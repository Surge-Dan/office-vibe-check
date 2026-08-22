const questions = require('../../data/questions.js');
const types = require('../../data/types.js');
const {
  calculateResult,
  formatProgress,
  formatProgressPercent,
  validateQuestionBank,
} = require('../../assets/quiz-core.js');

const LAST_RESULT_KEY = 'dagongren-last-result';

function getLastResult() {
  try {
    return xhs.getStorageSync(LAST_RESULT_KEY) || null;
  } catch (error) {
    return null;
  }
}

function saveLastResult(result) {
  try {
    xhs.setStorageSync(LAST_RESULT_KEY, { id: result.id });
  } catch (error) {
    // 本地缓存失败不影响本次测试和分享。
  }
}

function getType(id) {
  return types.find((type) => type.id === id) || null;
}

function getOptionClasses(selectedIndex) {
  return {
    optionAClass: selectedIndex === 0 ? 'is-selected' : '',
    optionBClass: selectedIndex === 1 ? 'is-selected' : '',
    optionCClass: selectedIndex === 2 ? 'is-selected' : '',
    optionDClass: selectedIndex === 3 ? 'is-selected' : '',
  };
}

function getResultState(result) {
  return {
    mode: 'result',
    isHome: false,
    isQuiz: false,
    isResult: true,
    isLastQuestion: false,
    result,
  };
}

Page({
  data: {
    mode: 'home',
    isHome: true,
    isQuiz: false,
    isResult: false,
    questions,
    currentQuestion: questions[0],
    currentIndex: 0,
    progress: formatProgress(0, questions.length),
    progressWidth: formatProgressPercent(0, questions.length),
    isLastQuestion: false,
    nextLabel: '继续',
    selectedIndex: -1,
    selectedOptionId: '',
    optionAClass: '',
    optionBClass: '',
    optionCClass: '',
    optionDClass: '',
    answers: [],
    result: null,
    hasLastResult: false,
  },

  onLoad(options = {}) {
    validateQuestionBank(questions, types);
    const last = getLastResult();
    const query = options.query || options;
    const sharedResult = getType(query && query.type);
    this.setData({
      hasLastResult: Boolean(last && getType(last.id)),
      ...(sharedResult ? getResultState(sharedResult) : {}),
    });
  },

  startQuiz() {
    this.setData({
      mode: 'quiz',
      isHome: false,
      isQuiz: true,
      isResult: false,
      currentQuestion: questions[0],
      currentIndex: 0,
      progress: formatProgress(0, questions.length),
      progressWidth: formatProgressPercent(0, questions.length),
      isLastQuestion: false,
      nextLabel: '继续',
      selectedIndex: -1,
      selectedOptionId: '',
      ...getOptionClasses(-1),
      answers: [],
      result: null,
    });
  },

  showLastResult() {
    const last = getLastResult();
    const result = last && getType(last.id);
    if (!result) return;
    this.setData(getResultState(result));
  },

  selectOption(event) {
    const index = Number(event.currentTarget.dataset.index);
    const option = this.data.currentQuestion.options[index];
    if (!option) return;

    const answers = this.data.answers.slice();
    answers[this.data.currentIndex] = option.id;
    this.setData({
      selectedIndex: index,
      selectedOptionId: option.id,
      ...getOptionClasses(index),
      answers,
    });
  },

  nextQuestion() {
    const selectedOption = this.data.currentQuestion.options[this.data.selectedIndex];
    const storedAnswer = this.data.answers[this.data.currentIndex];
    if (!selectedOption || storedAnswer !== selectedOption.id) {
      xhs.showToast({ title: '先选一个，再继续', icon: 'none' });
      return;
    }

    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= questions.length) {
      const result = calculateResult(this.data.answers, questions, types);
      saveLastResult(result);
      this.setData({
        ...getResultState(result),
        hasLastResult: true,
      });
      return;
    }

    const nextQuestion = questions[nextIndex];
    const selectedOptionId = this.data.answers[nextIndex] || '';
    const selectedIndex = nextQuestion.options.findIndex((option) => option.id === selectedOptionId);
    this.setData({
      currentQuestion: nextQuestion,
      currentIndex: nextIndex,
      progress: formatProgress(nextIndex, questions.length),
      progressWidth: formatProgressPercent(nextIndex, questions.length),
      isLastQuestion: nextIndex === questions.length - 1,
      nextLabel: nextIndex === questions.length - 1 ? '生成结果' : '继续',
      selectedIndex,
      selectedOptionId,
      ...getOptionClasses(selectedIndex),
    });
  },

  previousQuestion() {
    if (this.data.currentIndex === 0) {
      this.setData({
        mode: 'home',
        isHome: true,
        isQuiz: false,
        isResult: false,
      });
      return;
    }

    const previousIndex = this.data.currentIndex - 1;
    const previousQuestion = questions[previousIndex];
    const selectedOptionId = this.data.answers[previousIndex] || '';
    const selectedIndex = previousQuestion.options.findIndex((option) => option.id === selectedOptionId);
    this.setData({
      currentQuestion: previousQuestion,
      currentIndex: previousIndex,
      progress: formatProgress(previousIndex, questions.length),
      progressWidth: formatProgressPercent(previousIndex, questions.length),
      isLastQuestion: false,
      nextLabel: '继续',
      selectedIndex,
      selectedOptionId,
      ...getOptionClasses(selectedIndex),
    });
  },

  restartQuiz() {
    this.startQuiz();
  },

  onShareAppMessage() {
    const result = this.data.result;
    const payload = {
      title: result ? `我是${result.name}，你是哪种？` : '测测你的打工人体质',
      path: '/pages/index/index',
    };
    if (result) payload.query = `type=${encodeURIComponent(result.id)}`;
    return payload;
  },
});
