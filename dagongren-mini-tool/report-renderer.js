(function (root) {
  function replaceList(doc, id, items, className) {
    const list = doc.getElementById(id);
    list.replaceChildren();
    items.forEach((text, index) => {
      const item = doc.createElement('li');
      item.className = className || 'report-list-item';
      const marker = doc.createElement('span');
      marker.className = 'list-marker';
      marker.textContent = String(index + 1).padStart(2, '0');
      const copy = doc.createElement('span');
      copy.textContent = text;
      item.append(marker, copy);
      list.append(item);
    });
  }

  function renderDimensions(doc, report) {
    const container = doc.getElementById('dimension-list');
    container.replaceChildren();
    report.dimensions.forEach((dimension) => {
      const item = doc.createElement('article');
      item.className = 'dimension-row';
      const heading = doc.createElement('div');
      heading.className = 'dimension-heading';
      const name = doc.createElement('strong');
      name.textContent = dimension.name;
      const score = doc.createElement('span');
      score.textContent = `${dimension.score} · ${dimension.pole}`;
      heading.append(name, score);
      const track = doc.createElement('div');
      track.className = 'dimension-track';
      const fill = doc.createElement('span');
      fill.style.width = `${dimension.score}%`;
      fill.style.backgroundColor = dimension.color;
      track.append(fill);
      const copy = doc.createElement('p');
      copy.textContent = dimension.explanation;
      item.append(heading, track, copy);
      container.append(item);
    });
  }

  function renderReport(doc, report) {
    const context = root.DagongrenContext ? root.DagongrenContext.getLabels(report.context) : { industryShort: '跨行业通用', roleShort: '通用岗位' };
    doc.getElementById('result-context').textContent = `${context.industryShort} · ${context.roleShort}`;
    doc.getElementById('result-code').textContent = `SPECIMEN / ${report.code} / ${report.signature}`;
    doc.getElementById('result-name').textContent = report.name;
    doc.getElementById('result-subtype').textContent = report.subtype;
    doc.getElementById('result-verdict').textContent = report.verdict;
    doc.getElementById('result-overview').textContent = report.overview;
    doc.getElementById('secondary-type').textContent = report.secondary.name;
    doc.getElementById('secondary-difference').textContent = report.secondary.differences.map((difference) => `${difference.name}相差 ${difference.gap} 点`).join('，');
    doc.getElementById('work-mode').textContent = report.workMode;
    doc.getElementById('warning-copy').textContent = report.warning;
    replaceList(doc, 'strength-list', report.strengths);
    replaceList(doc, 'risk-list', report.risks);
    replaceList(doc, 'action-list', report.actions, 'report-list-item action-item');
    renderDimensions(doc, report);
    root.DagongrenAnimals.renderCanvas(doc.getElementById('animal-stamp'), report.code, { size: 210, color: '#E8513D', paper: '#F3F0E8' });
    root.DagongrenRadar.drawRadar(doc.getElementById('radar-canvas'), report.dimensions, { width: 370, height: 370 });
  }

  root.DagongrenReportRenderer = { renderReport };
})(typeof window !== 'undefined' ? window : globalThis);
