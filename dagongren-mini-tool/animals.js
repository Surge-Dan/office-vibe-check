(function (root) {
  function hashCode(code) {
    return String(code).split('').reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  }

  function drawStamp(context, code, centerX, centerY, size, color, paper) {
    const ctx = context;
    const seed = hashCode(code);
    const earStyle = seed % 4;
    const eyeStyle = Math.floor(seed / 5) % 3;
    const tilt = (((seed % 9) - 4) * Math.PI) / 360;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(tilt);
    ctx.strokeStyle = color || '#181815';
    ctx.fillStyle = paper || '#F3F0E8';
    ctx.lineWidth = Math.max(2, size * 0.026);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (ctx.createLinearGradient) {
      const wash = ctx.createLinearGradient(-size * 0.45, -size * 0.45, size * 0.45, size * 0.5);
      wash.addColorStop(0, paper || '#F3F0E8');
      wash.addColorStop(0.58, '#FFFDF6');
      wash.addColorStop(1, paper || '#F3F0E8');
      ctx.fillStyle = wash;
    }
    ctx.shadowColor = 'rgba(24,24,21,.12)';
    ctx.shadowBlur = size * 0.018;
    ctx.shadowOffsetY = size * 0.012;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 0.42;
    if (ctx.setLineDash) ctx.setLineDash([size * 0.018, size * 0.028]);
    ctx.beginPath();
    ctx.arc(size * 0.012, -size * 0.006, size * 0.45, 0.08, Math.PI * 2.04);
    ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    ctx.beginPath();
    if (earStyle === 0) {
      ctx.moveTo(-size * 0.28, -size * 0.22); ctx.lineTo(-size * 0.38, -size * 0.46); ctx.lineTo(-size * 0.08, -size * 0.34);
      ctx.moveTo(size * 0.28, -size * 0.22); ctx.lineTo(size * 0.38, -size * 0.46); ctx.lineTo(size * 0.08, -size * 0.34);
    } else if (earStyle === 1) {
      ctx.arc(-size * 0.27, -size * 0.29, size * 0.13, Math.PI * 0.7, Math.PI * 2.05);
      ctx.moveTo(size * 0.14, -size * 0.35); ctx.arc(size * 0.27, -size * 0.29, size * 0.13, Math.PI * 0.95, Math.PI * 2.3);
    } else if (earStyle === 2) {
      ctx.moveTo(-size * 0.23, -size * 0.25); ctx.quadraticCurveTo(-size * 0.46, -size * 0.62, -size * 0.06, -size * 0.35);
      ctx.moveTo(size * 0.23, -size * 0.25); ctx.quadraticCurveTo(size * 0.46, -size * 0.62, size * 0.06, -size * 0.35);
    } else {
      ctx.moveTo(-size * 0.30, -size * 0.24); ctx.quadraticCurveTo(-size * 0.52, -size * 0.20, -size * 0.34, size * 0.02);
      ctx.moveTo(size * 0.30, -size * 0.24); ctx.quadraticCurveTo(size * 0.52, -size * 0.20, size * 0.34, size * 0.02);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.22, -size * 0.12);
    ctx.bezierCurveTo(-size * 0.17, -size * 0.27, size * 0.17, -size * 0.27, size * 0.22, -size * 0.12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.31, -size * 0.08);
    ctx.quadraticCurveTo(-size * 0.25, -size * 0.32, 0, -size * 0.32);
    ctx.quadraticCurveTo(size * 0.25, -size * 0.32, size * 0.31, -size * 0.08);
    ctx.quadraticCurveTo(size * 0.36, size * 0.25, 0, size * 0.34);
    ctx.quadraticCurveTo(-size * 0.36, size * 0.25, -size * 0.31, -size * 0.08);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color || '#181815';
    const eyeY = -size * 0.06;
    if (eyeStyle === 0) {
      ctx.beginPath(); ctx.arc(-size * 0.13, eyeY, size * 0.026, 0, Math.PI * 2); ctx.arc(size * 0.13, eyeY, size * 0.026, 0, Math.PI * 2); ctx.fill();
    } else if (eyeStyle === 1) {
      ctx.beginPath(); ctx.moveTo(-size * 0.19, eyeY); ctx.lineTo(-size * 0.08, eyeY + size * 0.015); ctx.moveTo(size * 0.08, eyeY + size * 0.015); ctx.lineTo(size * 0.19, eyeY); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-size * 0.13, eyeY, size * 0.045, 0, Math.PI * 2); ctx.arc(size * 0.13, eyeY, size * 0.045, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-size * 0.13, eyeY, size * 0.014, 0, Math.PI * 2); ctx.arc(size * 0.13, eyeY, size * 0.014, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, size * 0.07); ctx.lineTo(0, size * 0.11); ctx.lineTo(size * 0.04, size * 0.07);
    ctx.moveTo(0, size * 0.11); ctx.quadraticCurveTo(-size * 0.07, size * 0.18, -size * 0.12, size * 0.12);
    ctx.moveTo(0, size * 0.11); ctx.quadraticCurveTo(size * 0.07, size * 0.18, size * 0.12, size * 0.12);
    ctx.stroke();
    ctx.globalAlpha = 0.55;
    for (let line = -1; line <= 1; line += 2) {
      ctx.beginPath();
      ctx.moveTo(line * size * 0.13, size * 0.12); ctx.lineTo(line * size * 0.30, size * 0.08);
      ctx.moveTo(line * size * 0.13, size * 0.16); ctx.lineTo(line * size * 0.31, size * 0.18);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.24;
    for (let mark = -2; mark <= 2; mark += 1) {
      const offset = mark * size * 0.075;
      ctx.beginPath();
      ctx.moveTo(-size * 0.2 + offset, size * 0.27);
      ctx.bezierCurveTo(-size * 0.13 + offset, size * 0.31, -size * 0.08 + offset, size * 0.31, -size * 0.02 + offset, size * 0.28);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderCanvas(canvas, code, options) {
    if (!canvas || !canvas.getContext) return false;
    const settings = options || {};
    const ratio = settings.pixelRatio || root.devicePixelRatio || 1;
    const displaySize = settings.size || canvas.clientWidth || 180;
    canvas.width = Math.round(displaySize * ratio);
    canvas.height = Math.round(displaySize * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, displaySize, displaySize);
    drawStamp(ctx, code, displaySize / 2, displaySize / 2, displaySize * 0.88, settings.color || '#181815', settings.paper || '#F3F0E8');
    return true;
  }

  root.DagongrenAnimals = { drawStamp, renderCanvas };
})(typeof window !== 'undefined' ? window : globalThis);
