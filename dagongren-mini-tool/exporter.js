(function (root) {
  const WIDTH = 1080;
  const HEIGHT = 2400;
  const PAPER = '#F3F0E8';
  const INK = '#181815';
  const BLUE = '#2457D6';
  const RED = '#E8513D';

  function requireDataUri(dataUri) {
    if (typeof dataUri !== 'string' || !/^data:image\/(?:jpeg|png);base64,/.test(dataUri)) throw new Error('报告图片数据无效');
  }

  async function saveToAlbum(dataUri, bridge) {
    requireDataUri(dataUri);
    if (!bridge || typeof bridge.writeTempFile !== 'function' || typeof bridge.saveImageToPhotosAlbum !== 'function') throw new Error('请在小红书 App 内保存报告');
    const temporary = await bridge.writeTempFile({ data: dataUri });
    if (!temporary || !temporary.filePath) throw new Error('临时报告文件生成失败');
    await bridge.saveImageToPhotosAlbum({ filePath: temporary.filePath });
    return temporary.filePath;
  }

  async function publishNote(dataUri, report, bridge) {
    requireDataUri(dataUri);
    if (!bridge || typeof bridge.postNote !== 'function') throw new Error('小红书发布能力不可用');
    const title = String(report.shareTitle || `我是${report.name || '打工人'}，你呢`).slice(0, 20);
    const content = String(report.shareContent || `${report.verdict || ''}\n#打工人体质 #班味鉴定所`).slice(0, 1000);
    await bridge.postNote({
      title,
      content,
      pageType: 'photo_publish',
      mediaInfo: { image_resources: [{ url: dataUri }] },
    });
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const characters = String(text).split('');
    const lines = [];
    let line = '';
    characters.forEach((character) => {
      const candidate = line + character;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = character;
      } else line = candidate;
    });
    if (line) lines.push(line);
    const visible = lines.slice(0, maxLines || lines.length);
    visible.forEach((content, index) => ctx.fillText(content, x, y + (index * lineHeight)));
    return y + (visible.length * lineHeight);
  }

  function rule(ctx, y, color) {
    ctx.strokeStyle = color || 'rgba(24,24,21,.25)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(72, y); ctx.lineTo(WIDTH - 72, y); ctx.stroke();
  }

  function sectionTitle(ctx, label, title, y) {
    ctx.fillStyle = BLUE; ctx.font = '700 24px monospace'; ctx.fillText(label, 72, y);
    ctx.fillStyle = INK; ctx.font = '700 42px "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillText(title, 142, y + 4);
    return y + 46;
  }

  function drawList(ctx, items, y, options) {
    const settings = options || {};
    ctx.font = `${settings.bold ? '700' : '400'} 28px "PingFang SC", "Microsoft YaHei", sans-serif`;
    items.forEach((item, index) => {
      ctx.fillStyle = settings.marker || RED;
      ctx.font = '700 20px monospace'; ctx.fillText(String(index + 1).padStart(2, '0'), 78, y + 28);
      ctx.fillStyle = INK;
      ctx.font = `${settings.bold ? '700' : '400'} 28px "PingFang SC", "Microsoft YaHei", sans-serif`;
      y = wrapText(ctx, item, 136, y + 28, 850, 42, 2) + 18;
    });
    return y;
  }

  function drawColumnList(ctx, items, x, y, maxWidth, markerColor) {
    items.forEach((item, index) => {
      ctx.fillStyle = markerColor;
      ctx.font = '700 18px monospace';
      ctx.fillText(String(index + 1).padStart(2, '0'), x, y + 22);
      ctx.fillStyle = INK;
      ctx.font = '400 23px "PingFang SC", "Microsoft YaHei", sans-serif';
      wrapText(ctx, item, x + 48, y + 22, maxWidth - 48, 34, 2);
      y += 78;
    });
    return y;
  }

  function createReportImage(report, data, doc) {
    if (!report || !doc || !doc.createElement) throw new Error('报告画布不可用');
    const canvas = doc.createElement('canvas');
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('报告画布不可用');
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = BLUE; ctx.fillRect(0, 0, 28, HEIGHT);
    ctx.fillStyle = RED; ctx.fillRect(WIDTH - 28, 0, 28, 340);
    ctx.fillStyle = INK; ctx.font = '700 24px monospace'; ctx.fillText('WORKPLACE SPECIMEN / 02', 72, 82);
    ctx.textAlign = 'right'; ctx.fillStyle = BLUE; ctx.fillText(report.signature, WIDTH - 72, 82); ctx.textAlign = 'left';
    rule(ctx, 112);
    root.DagongrenAnimals.drawStamp(ctx, report.code, 190, 286, 230, RED, PAPER);
    ctx.fillStyle = BLUE; ctx.font = '700 24px monospace'; ctx.fillText(`TYPE / ${report.code}`, 350, 198);
    ctx.fillStyle = INK; ctx.font = '700 72px "Songti SC", "STSong", serif';
    wrapText(ctx, report.name, 350, 282, 620, 82, 2);
    ctx.fillStyle = RED; ctx.font = '700 28px "PingFang SC", sans-serif'; ctx.fillText(report.subtype, 352, 356);
    ctx.fillStyle = INK; ctx.font = '700 36px "Songti SC", "STSong", serif';
    wrapText(ctx, report.verdict, 72, 472, 936, 52, 2);
    rule(ctx, 570);

    ctx.fillStyle = INK;
    const radarCanvas = doc.createElement('canvas');
    root.DagongrenRadar.drawRadar(radarCanvas, report.dimensions, { width: 480, height: 480, pixelRatio: 1 });
    ctx.drawImage(radarCanvas, 44, 600, 480, 480);
    ctx.font = '700 24px monospace'; ctx.fillStyle = BLUE; ctx.fillText('9-DIMENSION PROFILE', 560, 640);
    report.dimensions.forEach((dimension, index) => {
      const y = 690 + (index * 42);
      ctx.fillStyle = INK; ctx.font = '400 24px "PingFang SC", sans-serif'; ctx.fillText(dimension.name, 560, y);
      ctx.fillStyle = dimension.color; ctx.fillRect(720, y - 18, (dimension.score / 100) * 220, 12);
      ctx.fillStyle = INK; ctx.font = '700 20px monospace'; ctx.textAlign = 'right'; ctx.fillText(String(dimension.score), 980, y); ctx.textAlign = 'left';
    });
    rule(ctx, 1110);

    let y = sectionTitle(ctx, '01', '优势 / 雷区', 1170);
    ctx.fillStyle = RED; ctx.font = '700 24px "PingFang SC", sans-serif'; ctx.fillText('你的职场优势', 78, y + 22);
    ctx.fillStyle = BLUE; ctx.fillText('你的职场雷区', 570, y + 22);
    const advantageEnd = drawColumnList(ctx, report.strengths, 78, y + 48, 430, RED);
    const riskEnd = drawColumnList(ctx, report.risks, 570, y + 48, 430, BLUE);
    y = Math.max(advantageEnd, riskEnd);
    rule(ctx, y + 8);
    y = sectionTitle(ctx, '02', '本周行动建议', y + 68);
    y = drawList(ctx, report.actions, y + 10, { bold: true });
    rule(ctx, y + 4);
    y = sectionTitle(ctx, '03', '适合你的工作模式', y + 58);
    ctx.fillStyle = INK; ctx.font = '400 28px "PingFang SC", sans-serif';
    y = wrapText(ctx, report.workMode, 72, y + 22, 936, 40, 2) + 22;
    ctx.fillStyle = RED; ctx.fillRect(72, y, 936, 128);
    ctx.fillStyle = PAPER; ctx.font = '700 23px monospace'; ctx.fillText('STOP-LOSS NOTE', 96, y + 36);
    ctx.font = '700 28px "PingFang SC", sans-serif'; wrapText(ctx, report.warning, 96, y + 78, 880, 40, 2);
    ctx.fillStyle = INK; ctx.font = '700 22px monospace'; ctx.fillText('班味鉴定所 · 结果仅供娱乐与自我观察', 72, HEIGHT - 54);
    ctx.textAlign = 'right'; ctx.fillStyle = BLUE; ctx.fillText(`SECOND / ${report.secondary.name}`, WIDTH - 72, HEIGHT - 54);
    return { canvas, dataUri: canvas.toDataURL('image/jpeg', 0.92), width: WIDTH, height: HEIGHT };
  }

  root.DagongrenExporter = { createReportImage, publishNote, saveToAlbum, WIDTH, HEIGHT };
})(typeof window !== 'undefined' ? window : globalThis);
