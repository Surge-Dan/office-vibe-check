(function (root, doc) {
  const data = root.DagongrenAssessmentData;
  const engine = root.DagongrenAssessmentEngine;
  const contextApi = root.DagongrenContext;
  const transitions = root.DagongrenTransitions;
  const SESSION_KEY = 'office-vibe-assessment-session-v2';
  const REPORT_KEY = 'office-vibe-assessment-report-v2';
  const anchorIds = data.questions.filter((question) => question.stage === 'anchor').map((question) => question.id);
  const questionById = Object.fromEntries(data.questions.map((question) => [question.id, question]));
  let generatedImage = null;
  let previewOpener = null;
  let pendingIndex = 0;
  const state = { mode: 'home', index: 0, route: anchorIds.slice(), answers: {}, report: null, context: contextApi.normalize(null), selectionStep: 1 };

  function byId(id) { return doc.getElementById(id); }
  function setText(id, text) { byId(id).textContent = text || ''; }
  function scrollTop() { try { root.scrollTo({ top: 0, behavior: 'auto' }); } catch (error) { root.scrollTo(0, 0); } }
  function getBridge() { return window.xhs && window.xhs.miniTool ? window.xhs.miniTool : null; }

  function safeRead(key) {
    try { const raw = root.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (error) { return null; }
  }
  function safeWrite(key, value) { try { root.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; } }
  function safeRemove(key) { try { root.localStorage.removeItem(key); } catch (error) { /* 当前流程仍可继续。 */ } }

  function validReport(report) {
    return engine.isValidReportSnapshot(report, data);
  }
  function validSession(session) {
    return engine.isValidSessionSnapshot(session, data);
  }

  function persistSession() {
    safeWrite(SESSION_KEY, { version: data.version, index: state.index, route: state.route, answers: state.answers, context: state.context });
  }
  function clearAdaptiveAnswers() {
    Object.keys(state.answers).forEach((id) => { if (!anchorIds.includes(id)) delete state.answers[id]; });
    state.route = anchorIds.slice();
  }

  function setScreen(id) {
    ['home-screen', 'quiz-screen', 'transition-screen', 'report-screen'].forEach((screenId) => { byId(screenId).hidden = screenId !== id; });
    state.mode = id.replace('-screen', '');
    scrollTop();
  }

  function renderContextPicker() {
    const renderGroup = (containerId, items, key) => {
      const list = byId(containerId);
      list.replaceChildren();
      items.forEach((item) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'context-chip';
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(state.context[key] === item.id));
        button.textContent = item.label;
        button.addEventListener('click', () => {
          const next = { ...state.context, [key]: item.id };
          if (key === 'identityId' || key === 'industryId') next.roleId = 'other-role';
          state.context = contextApi.normalize(next);
          if (key === 'identityId') state.selectionStep = 2;
          if (key === 'industryId') state.selectionStep = 3;
          renderContextPicker();
        });
        list.append(button);
      });
    };
    const steps = ['identity-step', 'industry-step', 'role-step'];
    steps.forEach((id, index) => { byId(id).hidden = state.selectionStep !== index + 1; });
    setText('context-step-indicator', `第 ${state.selectionStep} 步 / 3　${['先定身份大类', '再选所在行业', '最后选具体岗位'][state.selectionStep - 1]}`);
    byId('context-back-button').hidden = state.selectionStep === 1;
    setText('context-next-button', state.selectionStep === 3 ? '已选好，开始鉴定 →' : '下一步 →');
    renderGroup('identity-options', contextApi.identities, 'identityId');
    renderGroup('industry-options', contextApi.industries, 'industryId');
    renderGroup('role-options', contextApi.getRolesFor(state.context.identityId, state.context.industryId), 'roleId');
  }

  function renderHome() {
    setScreen('home-screen');
    renderContextPicker();
    const cachedReport = safeRead(REPORT_KEY);
    if (cachedReport && !validReport(cachedReport)) safeRemove(REPORT_KEY);
    byId('last-report-button').hidden = !validReport(cachedReport);
    root.DagongrenAnimals.renderCanvas(byId('home-stamp'), 'CAPY', { size: 210, color: '#E8513D', paper: '#F3F0E8' });
  }

  function renderOptions(question) {
    const list = byId('option-list');
    list.replaceChildren();
    question.options.forEach((option, index) => {
      const button = doc.createElement('button');
      const marker = doc.createElement('span');
      const copy = doc.createElement('span');
      button.type = 'button'; button.className = 'option-button'; button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(state.answers[question.id] === option.id));
      marker.className = 'option-index'; marker.textContent = String.fromCharCode(65 + index);
      copy.className = 'option-copy'; copy.textContent = contextApi.adaptScene(option.text, state.context);
      button.append(marker, copy);
      button.addEventListener('click', () => selectOption(option.id));
      list.append(button);
    });
  }

  function renderQuiz() {
    setScreen('quiz-screen');
    const question = questionById[state.route[state.index]];
    const totalLabel = state.route.length > 12 ? state.route.length : '18+';
    byId('quiz-screen').dataset.questionId = question.id;
    const stageLabel = question.stage === 'anchor' ? '基础画像 / BASE PROFILE' : question.stage === 'context' ? (question.source === 'role' ? '岗位现场 / ROLE SCENE' : '行业补充 / INDUSTRY NOTE') : question.stage === 'calibration' ? '交叉校准 / CALIBRATION' : question.stage === 'hidden' ? '隐藏档案 / HIDDEN NOTE' : '定向深挖 / TARGETED PATH';
    setText('phase-label', stageLabel);
    setText('progress-label', `${String(state.index + 1).padStart(2, '0')} / ${totalLabel}`);
    setText('question-number', `Q.${String(state.index + 1).padStart(2, '0')}`);
    setText('focus-label', data.dimensions.find((dimension) => dimension.id === question.focus).name);
    setText('question-title', contextApi.adaptScene(question.scene, state.context));
    setText('quiz-message', '');
    byId('progress-fill').style.width = `${Math.round(((state.index + 1) / (state.route.length > 12 ? state.route.length : 18)) * 100)}%`;
    setText('next-button', state.index === state.route.length - 1 ? '生成报告 →' : '继续 →');
    renderOptions(question);
  }

  function selectOption(optionId) {
    const question = questionById[state.route[state.index]];
    if (!question.options.some((option) => option.id === optionId)) return;
    const previous = state.answers[question.id];
    state.answers[question.id] = optionId;
    if (question.stage === 'anchor' && previous && previous !== optionId && state.route.length > 12) clearAdaptiveAnswers();
    persistSession();
    renderOptions(question);
    setText('quiz-message', '');
  }

  function showTransition(nextIndex, focus, stage) {
    pendingIndex = nextIndex;
    const copy = transitions.pick({ stage: stage || 'anchor', index: nextIndex, focus, context: state.context });
    setText('transition-copy', copy.headline);
    setText('transition-detail', copy.detail);
    setScreen('transition-screen');
  }

  function completeAssessment() {
    state.report = engine.createReport(state.answers, state.route, data, state.context);
    safeWrite(REPORT_KEY, state.report);
    safeRemove(SESSION_KEY);
    generatedImage = null;
    renderReport();
  }

  function nextQuestion() {
    const question = questionById[state.route[state.index]];
    if (!state.answers[question.id]) { setText('quiz-message', '先选一个真实反应，再继续。'); byId('option-list').focus(); return; }
    if (state.index === 11 && state.route.length === 12) {
      try { state.route = engine.buildAdaptiveRoute(state.answers, data, state.context); } catch (error) { setText('quiz-message', '动态路径生成失败，请返回检查答案。'); return; }
      persistSession();
      showTransition(12, question.focus, 'branch');
      return;
    }
    if (state.index === state.route.length - 1) { completeAssessment(); return; }
    const nextIndex = state.index + 1;
    if (nextIndex === 4 || nextIndex === 8) { showTransition(nextIndex, question.focus, 'anchor'); return; }
    state.index = nextIndex; persistSession(); renderQuiz();
  }

  function continueAfterTransition() { state.index = pendingIndex; persistSession(); renderQuiz(); }

  function previousQuestion() {
    if (state.index === 0) { renderHome(); return; }
    state.index -= 1; persistSession(); renderQuiz();
  }

  function startAssessment() {
    state.context = contextApi.normalize(state.context);
    state.index = 0; state.route = anchorIds.slice(); state.answers = {}; state.report = null; generatedImage = null;
    persistSession(); renderQuiz();
  }

  function renderReport() {
    if (!validReport(state.report)) { renderHome(); return; }
    setScreen('report-screen');
    root.DagongrenReportRenderer.renderReport(doc, state.report);
    setText('export-status', '');
  }

  function showLastReport() {
    const report = safeRead(REPORT_KEY);
    if (!validReport(report)) { byId('last-report-button').hidden = true; return; }
    state.report = report; renderReport();
  }

  function getGeneratedImage() {
    if (!generatedImage) generatedImage = root.DagongrenExporter.createReportImage(state.report, data, doc);
    return generatedImage;
  }

  function setExportBusy(isBusy) {
    ['save-image-button', 'publish-note-button', 'preview-report-button'].forEach((id) => { byId(id).disabled = isBusy; });
  }

  async function saveImage() {
    setExportBusy(true); setText('export-status', '正在生成 1080 × 2400 高清报告…');
    try {
      const image = getGeneratedImage();
      await root.DagongrenExporter.saveToAlbum(image.dataUri, getBridge());
      setText('export-status', '已保存到系统相册。');
    } catch (error) {
      setText('export-status', error && error.message ? error.message : '保存失败，请稍后重试。');
      showPreview();
    } finally { setExportBusy(false); }
  }

  async function publishNote() {
    setExportBusy(true); setText('export-status', '正在整理笔记封面和文案…');
    try {
      const image = getGeneratedImage();
      await root.DagongrenExporter.publishNote(image.dataUri, state.report, getBridge());
      setText('export-status', '已打开笔记发布页，最终发布由你确认。');
    } catch (error) { setText('export-status', error && error.message ? error.message : '发布失败，请稍后重试。'); }
    finally { setExportBusy(false); }
  }

  function showPreview() {
    try {
      const image = getGeneratedImage();
      previewOpener = doc.activeElement;
      byId('export-preview-image').src = image.dataUri;
      byId('export-preview').hidden = false;
      byId('close-preview-button').focus();
    } catch (error) { setText('export-status', error && error.message ? error.message : '报告预览生成失败。'); }
  }
  function closePreview() {
    byId('export-preview').hidden = true;
    const target = previewOpener && previewOpener.isConnected ? previewOpener : byId('preview-report-button');
    previewOpener = null;
    target.focus();
  }
  function handlePreviewKeydown(event) {
    if (byId('export-preview').hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closePreview(); }
    else if (event.key === 'Tab') { event.preventDefault(); byId('close-preview-button').focus(); }
  }

  function restoreSession() {
    const session = safeRead(SESSION_KEY);
    if (!validSession(session)) { if (session) safeRemove(SESSION_KEY); return false; }
    state.index = session.index; state.route = session.route; state.answers = session.answers; state.context = contextApi.normalize(session.context); renderQuiz(); return true;
  }

  function init() {
    try { engine.validateAssessmentData(data); } catch (error) {
      renderHome(); setText('home-error', `档案数据损坏，请重新打开。错误码：DATA-${String(error.message).length}`); byId('start-button').disabled = true; return;
    }
    byId('start-button').addEventListener('click', startAssessment);
    byId('context-next-button').addEventListener('click', () => {
      if (state.selectionStep < 3) { state.selectionStep += 1; renderContextPicker(); return; }
      startAssessment();
    });
    byId('context-back-button').addEventListener('click', () => { if (state.selectionStep > 1) { state.selectionStep -= 1; renderContextPicker(); } });
    byId('context-skip-button').addEventListener('click', () => { state.context = contextApi.normalize(null); startAssessment(); });
    byId('last-report-button').addEventListener('click', showLastReport);
    byId('back-button').addEventListener('click', previousQuestion);
    byId('next-button').addEventListener('click', nextQuestion);
    byId('transition-button').addEventListener('click', continueAfterTransition);
    byId('save-image-button').addEventListener('click', saveImage);
    byId('publish-note-button').addEventListener('click', publishNote);
    byId('preview-report-button').addEventListener('click', showPreview);
    byId('close-preview-button').addEventListener('click', closePreview);
    doc.addEventListener('keydown', handlePreviewKeydown);
    byId('restart-button').addEventListener('click', startAssessment);
    if (!restoreSession()) renderHome();
  }

  root.DagongrenMiniToolApp = { init, nextQuestion, previousQuestion, selectOption, startAssessment };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window, document);
