(function (root) {
  const profiles = {
    CAPY: { palette: ['#E7B37A', '#F6D7A8', '#EF6C55', '#2F6F69', '#F5E9D0'], shape: 0, mark: 'leaf' },
    HEDGE: { palette: ['#B77C50', '#EBC18E', '#E95B52', '#405E7A', '#F4D6A6'], shape: 1, mark: 'spine' },
    DEER: { palette: ['#C88B62', '#F3D9AD', '#E65348', '#3A6E84', '#F2C96B'], shape: 2, mark: 'antler' },
    CIVET: { palette: ['#8E6E68', '#D9B8A9', '#EE7356', '#514D7A', '#E9D7C4'], shape: 3, mark: 'mask' },
    WOLF: { palette: ['#68798A', '#C6D2D7', '#E75145', '#263D57', '#E6B66F'], shape: 4, mark: 'bolt' },
    PARROT: { palette: ['#2C9A80', '#F2D15E', '#EC6556', '#3C4C99', '#F6EBC5'], shape: 5, mark: 'feather' },
    SHIBA: { palette: ['#D8794D', '#F4C28F', '#F04D4F', '#355B6C', '#F4E2C5'], shape: 6, mark: 'bandana' },
    OX: { palette: ['#6F8076', '#D4BC91', '#E8654F', '#B74449', '#EEDFC7'], shape: 7, mark: 'horn' },
    OTTER: { palette: ['#8D7462', '#E5C19C', '#E75E4D', '#3C7480', '#F5E7C9'], shape: 8, mark: 'float' },
    MEERKAT: { palette: ['#C38C63', '#F0D09A', '#DB5B4D', '#40577C', '#F3E4C6'], shape: 9, mark: 'radar' },
    CHEETAH: { palette: ['#DCA85D', '#F8DC9C', '#E94E45', '#3D5670', '#F1E7C9'], shape: 10, mark: 'spot' },
    ELEPHANT: { palette: ['#7F8FA0', '#C7D1D4', '#E76154', '#566083', '#F0D8B4'], shape: 11, mark: 'flag' },
    DOLPHIN: { palette: ['#4F99AC', '#B8E0DD', '#F06A56', '#294F78', '#EAF0DB'], shape: 12, mark: 'wave' },
    CAMEL: { palette: ['#C99B65', '#F2D5A1', '#D95A50', '#536A5F', '#F5E9D0'], shape: 13, mark: 'saddle' },
    SLOTH: { palette: ['#8E9B79', '#D8D1A6', '#E96E59', '#45636C', '#F2E3C3'], shape: 14, mark: 'clock' },
    LYNX: { palette: ['#A17A67', '#E3C7A0', '#E75B50', '#4C5576', '#F5E2C1'], shape: 15, mark: 'tuft' },
    FOX: { palette: ['#DB7251', '#F5C995', '#EA514C', '#405C7E', '#F3E6CA'], shape: 16, mark: 'ticket' },
    BEE: { palette: ['#E4B743', '#FFF0A7', '#E95A4D', '#44516B', '#F6EACD'], shape: 17, mark: 'wing' },
    SNOW: { palette: ['#B4C8D3', '#F0F2E9', '#E76058', '#536B88', '#EAC58F'], shape: 18, mark: 'scarf' },
    SHEP: { palette: ['#657B72', '#C5D3C2', '#E4564F', '#334F62', '#EFD5A7'], shape: 19, mark: 'patch' },
    QCAT: { palette: ['#C47E84', '#F1C4BA', '#E95555', '#514F7B', '#F4DEC5'], shape: 20, mark: 'pixel' },
    OWL: { palette: ['#7B7090', '#D9C3D6', '#E96653', '#344E6B', '#F0D59F'], shape: 21, mark: 'moon' },
  };

  function hashCode(code) { return String(code).split('').reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7); }
  function pathRoundFace(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.30, -size * 0.08);
    ctx.quadraticCurveTo(-size * 0.29, -size * 0.34, 0, -size * 0.37);
    ctx.quadraticCurveTo(size * 0.29, -size * 0.34, size * 0.30, -size * 0.08);
    ctx.quadraticCurveTo(size * 0.34, size * 0.23, 0, size * 0.34);
    ctx.quadraticCurveTo(-size * 0.34, size * 0.23, -size * 0.30, -size * 0.08);
    ctx.closePath();
  }
  function drawEar(ctx, x, y, size, color, flip, round) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (round) ctx.arc(x, y, size * 0.13, 0, Math.PI * 2);
    else {
      ctx.moveTo(x, y + size * 0.14); ctx.quadraticCurveTo(x + flip * size * 0.02, y - size * 0.22, x + flip * size * 0.16, y - size * 0.32);
      ctx.quadraticCurveTo(x + flip * size * 0.16, y + size * 0.01, x, y + size * 0.14);
    }
    ctx.fill();
  }
  function drawMark(ctx, mark, p, size) {
    ctx.fillStyle = p[2];
    ctx.strokeStyle = p[3];
    ctx.lineWidth = Math.max(1.5, size * 0.016);
    ctx.beginPath();
    if (mark === 'leaf') { ctx.ellipse(-size * 0.13, -size * 0.12, size * 0.05, size * 0.13, -0.55, 0, Math.PI * 2); ctx.ellipse(size * 0.13, -size * 0.12, size * 0.05, size * 0.13, 0.55, 0, Math.PI * 2); }
    else if (mark === 'spine') { for (let i = -2; i <= 2; i += 1) { ctx.moveTo(i * size * 0.08, -size * 0.22); ctx.lineTo(i * size * 0.11, -size * 0.34); } }
    else if (mark === 'antler' || mark === 'horn' || mark === 'tuft') { ctx.moveTo(-size * 0.14, -size * 0.27); ctx.lineTo(-size * 0.22, -size * 0.42); ctx.lineTo(-size * 0.13, -size * 0.36); ctx.lineTo(-size * 0.06, -size * 0.46); ctx.moveTo(size * 0.14, -size * 0.27); ctx.lineTo(size * 0.22, -size * 0.42); ctx.lineTo(size * 0.13, -size * 0.36); ctx.lineTo(size * 0.06, -size * 0.46); }
    else if (mark === 'mask' || mark === 'bolt') { ctx.moveTo(-size * 0.27, -size * 0.07); ctx.lineTo(-size * 0.06, -size * 0.14); ctx.lineTo(-size * 0.18, size * 0.02); ctx.moveTo(size * 0.27, -size * 0.07); ctx.lineTo(size * 0.06, -size * 0.14); ctx.lineTo(size * 0.18, size * 0.02); }
    else if (mark === 'feather' || mark === 'wing') { ctx.ellipse(-size * 0.28, size * 0.02, size * 0.10, size * 0.22, -0.5, 0, Math.PI * 2); ctx.ellipse(size * 0.28, size * 0.02, size * 0.10, size * 0.22, 0.5, 0, Math.PI * 2); }
    else if (mark === 'spot' || mark === 'pixel') { for (let i = -1; i <= 1; i += 1) { ctx.rect(i * size * 0.12, -size * 0.22 + Math.abs(i) * size * 0.08, size * 0.05, size * 0.05); } }
    else if (mark === 'wave' || mark === 'moon') { ctx.arc(0, -size * 0.18, size * 0.12, 0.3, Math.PI * 1.7); }
    else { ctx.rect(-size * 0.17, -size * 0.18, size * 0.34, size * 0.08); }
    if (mark === 'spine' || mark === 'antler' || mark === 'horn' || mark === 'tuft' || mark === 'mask' || mark === 'bolt' || mark === 'wave' || mark === 'moon') ctx.stroke(); else ctx.fill();
  }
  function drawAccessory(ctx, mark, p, size) {
    ctx.fillStyle = p[2];
    ctx.strokeStyle = p[3];
    ctx.lineWidth = Math.max(1.5, size * 0.014);
    ctx.beginPath();
    if (mark === 'bandana' || mark === 'scarf') { ctx.moveTo(-size * 0.26, size * 0.18); ctx.lineTo(0, size * 0.28); ctx.lineTo(size * 0.26, size * 0.18); ctx.lineTo(0, size * 0.12); ctx.closePath(); ctx.fill(); }
    else if (mark === 'ticket' || mark === 'flag') { ctx.rect(size * 0.18, size * 0.18, size * 0.16, size * 0.11); ctx.fill(); ctx.stroke(); }
    else if (mark === 'float' || mark === 'saddle') { ctx.ellipse(0, size * 0.29, size * 0.26, size * 0.07, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (mark === 'radar' || mark === 'clock') { ctx.arc(0, size * 0.19, size * 0.09, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(0, size * 0.19); ctx.lineTo(size * 0.04, size * 0.14); ctx.stroke(); }
    else if (mark === 'patch') { ctx.rect(-size * 0.22, size * 0.12, size * 0.11, size * 0.16); ctx.fill(); }
    else { ctx.arc(0, size * 0.25, size * 0.10, 0, Math.PI * 2); ctx.fill(); }
  }

  function drawStamp(context, code, centerX, centerY, size, color, paper) {
    const ctx = context;
    const profile = profiles[code] || profiles.CAPY;
    const p = profile.palette;
    const seed = hashCode(code);
    const tilt = (((seed % 9) - 4) * Math.PI) / 360;
    ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(tilt);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = p[3]; ctx.lineWidth = Math.max(2, size * 0.018);
    if (ctx.createLinearGradient) {
      const wash = ctx.createLinearGradient(-size * 0.45, -size * 0.45, size * 0.45, size * 0.45);
      wash.addColorStop(0, p[4]); wash.addColorStop(0.55, p[1]); wash.addColorStop(1, p[4]);
      ctx.fillStyle = wash;
    }
    ctx.shadowColor = 'rgba(24,24,21,.16)'; ctx.shadowBlur = size * 0.02; ctx.shadowOffsetY = size * 0.016;
    ctx.fillStyle = p[4]; ctx.beginPath(); ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 0.35; ctx.strokeStyle = p[1]; ctx.beginPath(); ctx.arc(0, 0, size * 0.43, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    drawEar(ctx, -size * 0.25, -size * 0.28, size, p[0], -1, profile.shape % 4 === 0);
    drawEar(ctx, size * 0.25, -size * 0.28, size, p[0], 1, profile.shape % 4 === 0);
    ctx.fillStyle = p[0]; pathRoundFace(ctx, size); ctx.fill(); ctx.stroke();
    ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, size * 0.12, size * (0.15 + (profile.shape % 3) * 0.025), size * 0.13, 0, 0, Math.PI * 2); ctx.fill();
    drawMark(ctx, profile.mark, p, size);
    ctx.fillStyle = p[3];
    const eyeY = -size * 0.07;
    ctx.beginPath(); ctx.arc(-size * 0.12, eyeY, size * 0.028 + (profile.shape % 3) * size * 0.006, 0, Math.PI * 2); ctx.arc(size * 0.12, eyeY, size * 0.028 + (profile.shape % 3) * size * 0.006, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p[2]; ctx.beginPath(); ctx.arc(0, size * 0.08, size * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = p[3]; ctx.beginPath(); ctx.moveTo(-size * 0.05, size * 0.14); ctx.bezierCurveTo(-size * 0.02, size * 0.19, size * 0.02, size * 0.19, size * 0.05, size * 0.14); ctx.stroke();
    drawAccessory(ctx, profile.mark, p, size);
    ctx.globalAlpha = 0.48; ctx.fillStyle = p[2];
    for (let mark = -1; mark <= 1; mark += 1) { ctx.beginPath(); ctx.arc(mark * size * 0.23, size * 0.36, size * 0.012, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
  }

  function renderCanvas(canvas, code, options) {
    if (!canvas || !canvas.getContext) return false;
    const settings = options || {};
    const ratio = settings.pixelRatio || root.devicePixelRatio || 1;
    const displaySize = settings.size || canvas.clientWidth || 180;
    canvas.width = Math.round(displaySize * ratio); canvas.height = Math.round(displaySize * ratio);
    const ctx = canvas.getContext('2d'); if (!ctx) return false;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, displaySize, displaySize);
    drawStamp(ctx, code, displaySize / 2, displaySize / 2, displaySize * 0.88, settings.color || '#181815', settings.paper || '#F3F0E8');
    return true;
  }
  root.DagongrenAnimals = { profiles, drawStamp, renderCanvas };
})(typeof window !== 'undefined' ? window : globalThis);
