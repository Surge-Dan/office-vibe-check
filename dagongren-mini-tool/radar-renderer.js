(function (root) {
  function polygonPoint(centerX, centerY, radius, index, total) {
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / total);
    return [centerX + (Math.cos(angle) * radius), centerY + (Math.sin(angle) * radius)];
  }

  function drawRadar(canvas, dimensions, options) {
    if (!canvas || !canvas.getContext || !Array.isArray(dimensions) || !dimensions.length) return false;
    const settings = options || {};
    const ratio = settings.pixelRatio || root.devicePixelRatio || 1;
    const width = settings.width || canvas.clientWidth || 360;
    const height = settings.height || width;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.31;
    ctx.strokeStyle = settings.gridColor || 'rgba(24,24,21,.18)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1].forEach((scale) => {
      ctx.beginPath();
      dimensions.forEach((dimension, index) => {
        const point = polygonPoint(centerX, centerY, radius * scale, index, dimensions.length);
        if (index === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]);
      });
      ctx.closePath();
      ctx.stroke();
    });
    dimensions.forEach((dimension, index) => {
      const edge = polygonPoint(centerX, centerY, radius, index, dimensions.length);
      ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(edge[0], edge[1]); ctx.stroke();
    });
    ctx.fillStyle = settings.fillColor || 'rgba(36,87,214,.20)';
    ctx.strokeStyle = settings.lineColor || '#2457D6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    dimensions.forEach((dimension, index) => {
      const point = polygonPoint(centerX, centerY, radius * (dimension.score / 100), index, dimensions.length);
      if (index === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = settings.textColor || '#181815';
    ctx.font = `${Math.max(11, width * 0.032)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    dimensions.forEach((dimension, index) => {
      const label = polygonPoint(centerX, centerY, radius * 1.27, index, dimensions.length);
      ctx.fillText(dimension.name, label[0], label[1] - 7);
      ctx.fillStyle = dimension.color || settings.lineColor || '#2457D6';
      ctx.fillText(String(dimension.score), label[0], label[1] + 9);
      ctx.fillStyle = settings.textColor || '#181815';
    });
    return true;
  }

  root.DagongrenRadar = { drawRadar };
})(typeof window !== 'undefined' ? window : globalThis);
