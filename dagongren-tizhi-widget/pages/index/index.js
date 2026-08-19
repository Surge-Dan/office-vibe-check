const questions = require('../../data/questions.js');
const types = require('../../data/types.js');
const {
  calculateResult,
  formatProgress,
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

Page({
  data: {
    mode: 'home',
    questions,
    currentQuestion: questions[0],
    currentIndex: 0,
    progress: formatProgress(0, questions.length),
    progressWidth: 14,
    selectedIndex: -1,
    selectedOptionId: '',
    answers: [],
    result: null,
    hasLastResult: false,
  },

  onLoad() {
    validateQuestionBank(questions, types);
    const last = getLastResult();
    this.setData({
      hasLastResult: Boolean(last && getType(last.id)),
    });
  },

  startQuiz() {
    this.setData({
      mode: 'quiz',
      currentQuestion: questions[0],
      currentIndex: 0,
      progress: formatProgress(0, questions.length),
      progressWidth: 14,
      selectedIndex: -1,
      selectedOptionId: '',
      answers: [],
      result: null,
    });
  },

  showLastResult() {
    const last = getLastResult();
    const result = last && getType(last.id);
    if (!result) return;
    this.setData({ mode: 'result', result });
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
      answers,
    });
  },

  nextQuestion() {
    if (this.data.selectedIndex < 0) {
      xhs.showToast({ title: '先选一个，再继续', icon: 'none' });
      return;
    }

    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= questions.length) {
      const result = calculateResult(this.data.answers, questions, types);
      saveLastResult(result);
      this.setData({ mode: 'result', result, hasLastResult: true });
      return;
    }

    const nextQuestion = questions[nextIndex];
    const selectedOptionId = this.data.answers[nextIndex] || '';
    const selectedIndex = nextQuestion.options.findIndex((option) => option.id === selectedOptionId);
    this.setData({
      currentQuestion: nextQuestion,
      currentIndex: nextIndex,
      progress: formatProgress(nextIndex, questions.length),
      progressWidth: ((nextIndex + 1) / questions.length) * 100,
      selectedIndex,
      selectedOptionId,
    });
  },

  previousQuestion() {
    if (this.data.currentIndex === 0) {
      this.setData({ mode: 'home' });
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
      progressWidth: ((previousIndex + 1) / questions.length) * 100,
      selectedIndex,
      selectedOptionId,
    });
  },

  restartQuiz() {
    this.startQuiz();
  },

  onShareAppMessage() {
    const result = this.data.result;
    return {
      title: result ? `我是${result.name}，你是哪种？` : '测测你的打工人体质',
      path: 'pages/index/index',
    };
  },
});
