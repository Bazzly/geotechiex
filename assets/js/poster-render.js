/*
 * Canvas engine for daily GeoTechieX social images:
 * the Day Poster (quote + 7-point system) and the carousel slide set
 * (quote, challenge, what-we're-building, tech stack, 6 individual
 * step images, deploy, checklist) — all matching the brand's
 * black / off-white / electric-blue, grain-textured poster style.
 */

const INK = '#0a0a0a';
const PAPER = '#f4f2ee';
const STEEL = '#8a8a8a';
const LINE_COLOR = '#2a2a2a';
const ACCENT = '#3b6fed';

const DAY_W = 1080;
const DAY_H = 1620;
const SLIDE_W = 1080;
const SLIDE_H = 1440;
const OG_W = 1200;
const OG_H = 630;

const DAILY_SCORE_ITEMS = [
  { label: 'BUILD', desc: 'Create something' },
  { label: 'LEARN', desc: 'Get better' },
  { label: 'PUBLISH', desc: 'Share the journey' },
  { label: 'OUTREACH', desc: 'Find opportunities' },
  { label: 'CONTRIBUTE', desc: 'Ship open source' },
  { label: 'NETWORK', desc: 'Connect & engage' },
  { label: 'JOURNAL', desc: 'Reflect & improve' },
];

function pad3(n) {
  return String(Math.max(0, parseInt(n, 10) || 0)).padStart(3, '0');
}

// ---- font loading -----------------------------------------------------

async function ensurePosterFonts() {
  const specs = [
    '400 16px Inter', '500 16px Inter', '600 16px Inter', '700 16px Inter',
    'italic 400 16px Inter',
    '500 16px "Space Grotesk"', '600 16px "Space Grotesk"', '700 16px "Space Grotesk"',
  ];
  await Promise.all(specs.map((s) => document.fonts.load(s).catch(() => {})));
  await document.fonts.ready;
}

// ---- text helpers -------------------------------------------------------

function wrapText(ctx, text, maxWidth) {
  const paragraphs = String(text || '').split('\n');
  const lines = [];
  paragraphs.forEach((para) => {
    const words = para.split(' ').filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      return;
    }
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function drawTracked(ctx, text, x, y, { align = 'left', tracking = 0 } = {}) {
  const chars = String(text || '').split('');
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let startX = x;
  if (align === 'center') startX = x - total / 2;
  else if (align === 'right') startX = x - total;

  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  let cx = startX;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx, y);
    cx += widths[i] + tracking;
  });
  ctx.textAlign = prevAlign;
  return total;
}

function drawHighlightLine(ctx, line, x, y, { accentWords = [] } = {}) {
  const tokens = line.split(' ');
  const spaceW = ctx.measureText(' ').width;
  let cx = x;
  tokens.forEach((tok) => {
    const clean = tok.replace(/[^A-Z']/gi, '').toUpperCase();
    const isAccent = accentWords.includes(clean);
    ctx.fillStyle = isAccent ? ACCENT : PAPER;
    ctx.fillText(tok, cx, y);
    cx += ctx.measureText(tok).width + spaceW;
  });
}

function fitFontSize(ctx, text, maxWidth, { family = 'Space Grotesk', weight = 700, start = 300, min = 90, step = 4 } = {}) {
  let size = start;
  ctx.font = `${weight} ${size}px "${family}"`;
  while (ctx.measureText(text).width > maxWidth && size > min) {
    size -= step;
    ctx.font = `${weight} ${size}px "${family}"`;
  }
  return size;
}

// ---- grain / texture ------------------------------------------------------

let _noiseTile = null;
function getNoiseTile() {
  if (_noiseTile) return _noiseTile;
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 160;
  const cx = c.getContext('2d');
  const imgData = cx.createImageData(160, 160);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  cx.putImageData(imgData, 0, 0);
  _noiseTile = c;
  return c;
}

function paintGrain(ctx, w, h, alpha = 0.045) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(getNoiseTile(), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// Paints a solid shape/text on an offscreen canvas, then clips grain
// noise to only its opaque pixels (source-atop) for a textured-paper look.
function texturedFill(ctx, w, h, paintFn, { alpha = 0.45 } = {}) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  paintFn(octx);
  octx.globalCompositeOperation = 'source-atop';
  octx.globalAlpha = alpha;
  octx.fillStyle = octx.createPattern(getNoiseTile(), 'repeat');
  octx.fillRect(0, 0, w, h);
  ctx.drawImage(off, 0, 0);
}

function paintBackground(ctx, w, h) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  paintGrain(ctx, w, h, 0.045);
}

// ---- shared chrome: logo mark, header, footer ------------------------------

// A minimal map-pin mark for GeoTechieX: rounded head tapering to a point,
// with a small hollow center. Drawn as one continuous stroked path.
function drawLogoMark(ctx, cx, cy, r, color = PAPER) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const headR = r * 0.6;
  const headCy = cy - r * 0.25;
  const start = (150 * Math.PI) / 180;
  const end = (30 * Math.PI) / 180;

  ctx.beginPath();
  ctx.moveTo(cx + headR * Math.cos(start), headCy + headR * Math.sin(start));
  ctx.arc(cx, headCy, headR, start, end, false);
  ctx.lineTo(cx, cy + r);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, headCy, headR * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

const MARGIN_X = 64;

function drawHeader(ctx, w, { rightTop = 'DAILY', rightBottom = 'CHALLENGE' } = {}) {
  const y = 76;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAPER;
  ctx.font = '600 22px "Space Grotesk"';
  const leftW = drawTracked(ctx, 'GEOTECHIEX', MARGIN_X, y, { tracking: 2 });
  ctx.strokeStyle = 'rgba(244,242,238,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, y + 14);
  ctx.lineTo(MARGIN_X + Math.min(leftW, 170), y + 14);
  ctx.stroke();

  ctx.font = '600 19px "Space Grotesk"';
  ctx.fillStyle = PAPER;
  drawTracked(ctx, rightTop, w - MARGIN_X, y - 15, { align: 'right', tracking: 2 });
  drawTracked(ctx, rightBottom, w - MARGIN_X, y + 11, { align: 'right', tracking: 2 });
  ctx.beginPath();
  ctx.moveTo(w - MARGIN_X - 96, y + 24);
  ctx.lineTo(w - MARGIN_X, y + 24);
  ctx.stroke();
}

function drawXIcon(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = 'rgba(244,242,238,0.55)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, s, s);
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 6);
  ctx.lineTo(x + s - 6, y + s - 6);
  ctx.moveTo(x + s - 6, y + 6);
  ctx.lineTo(x + 6, y + s - 6);
  ctx.stroke();
  ctx.restore();
}

// `leftLabel` accepts either a day number (legacy call sites) or a string
// (e.g. an episode label or hashtag) for slide types that aren't day-based.
function drawFooter(ctx, w, h, leftLabel, { center = 'BUILD. DEPLOY. LEARN. REPEAT.' } = {}) {
  const y = h - 58;
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, y - 26);
  ctx.lineTo(w - MARGIN_X, y - 26);
  ctx.stroke();

  const left = typeof leftLabel === 'string' ? leftLabel : `/ DAY ${pad3(leftLabel)} OF 180`;

  ctx.fillStyle = STEEL;
  ctx.font = '600 17px "Space Grotesk"';
  ctx.textAlign = 'left';
  ctx.fillText(left, MARGIN_X, y);

  drawTracked(ctx, center, w / 2, y, { align: 'center', tracking: 2 });

  drawXIcon(ctx, w - MARGIN_X - 26, y - 20, 26);
}

// ---- Day Poster ------------------------------------------------------------

async function renderDayPoster(canvas, data) {
  await ensurePosterFonts();
  const w = DAY_W;
  const h = DAY_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: 'DAILY', rightBottom: 'CHALLENGE' });

  let y = 240;
  const dayText = `DAY ${pad3(data.day)}`;
  const dayFont = fitFontSize(ctx, dayText, w - MARGIN_X * 2, { start: 300, min: 140 });
  texturedFill(ctx, w, h, (octx) => {
    octx.fillStyle = PAPER;
    octx.font = `700 ${dayFont}px "Space Grotesk"`;
    octx.textAlign = 'left';
    octx.textBaseline = 'alphabetic';
    octx.fillText(dayText, MARGIN_X, y);
  }, { alpha: 0.5 });

  y += 100;
  const subFont = fitFontSize(ctx, 'BUILDING LIVE IN PUBLIC', w - MARGIN_X * 2, { start: 90, min: 40 });
  texturedFill(ctx, w, h, (octx) => {
    octx.fillStyle = PAPER;
    octx.font = `700 ${subFont}px "Space Grotesk"`;
    octx.textAlign = 'left';
    octx.fillText('BUILDING LIVE IN PUBLIC', MARGIN_X, y);
  }, { alpha: 0.4 });

  y += 44;
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, y);
  ctx.lineTo(w - MARGIN_X, y);
  ctx.stroke();
  y += 56;

  const colGap = 40;
  const leftW = (w - MARGIN_X * 2) * 0.42;
  const rightX = MARGIN_X + leftW + colGap;

  const colTop = y;
  let leftY = colTop + 30;
  ctx.font = '700 29px "Space Grotesk"';
  ctx.textAlign = 'left';
  const tagLines = wrapText(ctx, (data.tagline || '8 YEARS OF EXPERIENCE. STARTING AGAIN IN PUBLIC.').toUpperCase(), leftW);
  tagLines.forEach((line) => {
    drawHighlightLine(ctx, line, MARGIN_X, leftY, { accentWords: ['PUBLIC.', 'PUBLIC'] });
    leftY += 36;
  });
  leftY += 26;

  drawLogoMark(ctx, MARGIN_X + 15, leftY - 6, 15);
  ctx.font = '600 17px "Space Grotesk"';
  ctx.fillStyle = PAPER;
  drawTracked(ctx, 'GEOTECHIEX', MARGIN_X + 42, leftY, { tracking: 1 });
  leftY += 44;

  const boxTop = leftY;
  const boxH = 210;
  ctx.strokeStyle = 'rgba(244,242,238,0.4)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(MARGIN_X, boxTop, leftW, boxH);
  ctx.font = '700 21px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  drawTracked(ctx, 'FOCUS TODAY', MARGIN_X + 22, boxTop + 40, { tracking: 1 });
  ctx.font = 'italic 400 22px Inter';
  ctx.fillStyle = PAPER;
  const focusLines = (data.focusLines && data.focusLines.length ? data.focusLines : ['Set the foundation.', 'Build the habit.', 'Trust the process.']).slice(0, 3);
  focusLines.forEach((line, i) => {
    ctx.fillText(line, MARGIN_X + 22, boxTop + 82 + i * 34);
  });

  const rightBottom = boxTop + boxH;
  let ry = colTop + 46;
  const rowH = (rightBottom - colTop) / DAILY_SCORE_ITEMS.length;
  DAILY_SCORE_ITEMS.forEach((item) => {
    ctx.fillStyle = ACCENT;
    ctx.fillRect(rightX, ry - 14, 9, 9);
    ctx.font = '700 21px "Space Grotesk"';
    ctx.fillStyle = PAPER;
    ctx.fillText(item.label, rightX + 22, ry);
    const labelW = ctx.measureText(item.label).width;
    ctx.font = 'italic 400 20px Inter';
    ctx.fillStyle = '#c9c9c9';
    ctx.fillText(` — ${item.desc}`, rightX + 22 + labelW, ry);
    ry += rowH;
  });

  const zoneTop = rightBottom + 46;
  const zoneBottom = DAY_H - 58 - 26 - 30;

  const quoteFont = fitFontSize(ctx, 'MEASURE', w - MARGIN_X * 2 - 170, { start: 42, min: 26, weight: 700 });
  ctx.font = `700 ${quoteFont}px "Space Grotesk"`;
  const quoteText = (data.quote || 'YOU DON’T HAVE TO BE GREAT TO START, BUT YOU HAVE TO START TO BE GREAT.').toUpperCase();
  const qLines = wrapText(ctx, quoteText, w - MARGIN_X * 2 - 170).slice(0, 4);

  const contentH = 78 + qLines.length * (quoteFont + 12) + 40;
  const quoteBoxH = Math.min(Math.max(contentH, 200), zoneBottom - zoneTop);
  y = zoneTop + Math.max(0, (zoneBottom - zoneTop - quoteBoxH) / 2);

  ctx.strokeStyle = 'rgba(244,242,238,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(MARGIN_X, y, w - MARGIN_X * 2, quoteBoxH);

  ctx.font = '700 88px Georgia, "Times New Roman", serif';
  ctx.fillStyle = ACCENT;
  ctx.fillText('“', MARGIN_X + 26, y + 96);

  ctx.font = `700 ${quoteFont}px "Space Grotesk"`;
  let qy = y + 78;
  const accentWords = (data.highlight || 'START')
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);
  qLines.forEach((line) => {
    drawHighlightLine(ctx, line, MARGIN_X + 130, qy, { accentWords });
    qy += quoteFont + 12;
  });

  drawFooter(ctx, w, h, data.day);
}

// ---- Quote-only slide -------------------------------------------------------

async function renderQuoteSlide(canvas, data) {
  await ensurePosterFonts();
  const w = SLIDE_W;
  const h = SLIDE_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: `DAY ${pad3(data.day)}`, rightBottom: 'CHALLENGE' });

  ctx.font = '700 110px Georgia, "Times New Roman", serif';
  ctx.fillStyle = ACCENT;
  ctx.fillText('“', MARGIN_X, 260);

  const quoteFont = fitFontSize(ctx, 'MEASURE', w - MARGIN_X * 2, { start: 62, min: 34, weight: 700 });
  ctx.font = `700 ${quoteFont}px "Space Grotesk"`;
  const quoteText = (data.quote || 'YOU DON’T HAVE TO BE GREAT TO START, BUT YOU HAVE TO START TO BE GREAT.').toUpperCase();
  const qLines = wrapText(ctx, quoteText, w - MARGIN_X * 2).slice(0, 6);
  let qy = 340;
  const accentWords = (data.highlight || 'START').toUpperCase().split(/\s+/).filter(Boolean);
  qLines.forEach((line) => {
    drawHighlightLine(ctx, line, MARGIN_X, qy, { accentWords });
    qy += quoteFont + 16;
  });

  qy += 20;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, qy);
  ctx.lineTo(MARGIN_X + 90, qy);
  ctx.stroke();

  const sigY = h - 200;
  drawLogoMark(ctx, MARGIN_X + 15, sigY - 6, 15);
  ctx.font = '600 17px "Space Grotesk"';
  ctx.fillStyle = PAPER;
  drawTracked(ctx, 'GEOTECHIEX', MARGIN_X + 42, sigY, { tracking: 1 });

  ctx.font = '700 22px "Space Grotesk"';
  const tagLines = wrapText(ctx, (data.tagline || '8 YEARS OF EXPERIENCE. STARTING AGAIN IN PUBLIC.').toUpperCase(), w - MARGIN_X * 2);
  let ty = sigY + 40;
  tagLines.forEach((line) => {
    drawHighlightLine(ctx, line, MARGIN_X, ty, { accentWords: ['PUBLIC.', 'PUBLIC'] });
    ty += 30;
  });

  drawFooter(ctx, w, h, data.day);
}

// ---- Generic list slide (Challenge / Tech Stack / Deploy / Checklist) ------

function drawBullet(ctx, style, x, y) {
  ctx.save();
  if (style === 'number' || style === 'step') {
    // handled by caller (needs index)
  } else if (style === 'check') {
    ctx.strokeStyle = 'rgba(244,242,238,0.6)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x, y - 16, 20, 20);
  } else if (style === 'goal-check') {
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x + 18, y - 16);
    ctx.stroke();
  } else {
    ctx.fillStyle = ACCENT;
    ctx.fillRect(x, y - 15, 11, 11);
  }
  ctx.restore();
}

async function renderListSlide(canvas, data) {
  await ensurePosterFonts();
  const w = SLIDE_W;
  const h = SLIDE_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: `DAY ${pad3(data.day)}`, rightBottom: 'CHALLENGE' });

  let y = 190;
  ctx.font = '700 22px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  drawTracked(ctx, data.kicker || '', MARGIN_X, y, { tracking: 2 });
  y += 54;

  const headlineFont = fitFontSize(ctx, data.headline || '', w - MARGIN_X * 2, { start: 58, min: 34, weight: 700 });
  ctx.font = `700 ${headlineFont}px "Space Grotesk"`;
  ctx.fillStyle = PAPER;
  const headLines = wrapText(ctx, (data.headline || '').toUpperCase(), w - MARGIN_X * 2).slice(0, 2);
  headLines.forEach((line) => {
    ctx.fillText(line, MARGIN_X, y);
    y += headlineFont + 8;
  });
  y += 20;

  if (data.intro) {
    ctx.font = '400 24px Inter';
    ctx.fillStyle = '#c9c9c9';
    const introLines = wrapText(ctx, data.intro, w - MARGIN_X * 2).slice(0, 3);
    introLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X, y);
      y += 32;
    });
    y += 20;
  }

  const items = (data.items || []).filter((it) => it && (it.title || it.detail));
  const hasDetail = items.some((it) => it.detail);
  const rowGap = hasDetail ? 92 : 68;
  const blockH = items.length * rowGap;
  const zoneBottom = data.footNote ? h - 210 - 40 : h - 150;
  const available = zoneBottom - y;
  if (available > blockH) {
    y += (available - blockH) / 2;
  }

  items.forEach((item, i) => {
    const rowY = y + i * rowGap;

    if (data.bulletStyle === 'number') {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(MARGIN_X + 16, rowY - 8, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '700 18px "Space Grotesk"';
      ctx.fillStyle = ACCENT;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), MARGIN_X + 16, rowY - 2);
      ctx.textAlign = 'left';
    } else {
      drawBullet(ctx, data.bulletStyle, MARGIN_X, rowY);
    }

    const textX = MARGIN_X + 46;
    ctx.font = '600 26px "Space Grotesk"';
    ctx.fillStyle = PAPER;
    ctx.fillText(item.title || '', textX, rowY);

    if (item.detail) {
      ctx.font = '400 20px "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = STEEL;
      ctx.fillText(item.detail, textX, rowY + 30);
    }
  });

  if (data.footNote) {
    const boxY = h - 210;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(MARGIN_X, boxY, w - MARGIN_X * 2, 90);
    ctx.font = '700 22px "Space Grotesk"';
    ctx.fillStyle = PAPER;
    const noteLines = wrapText(ctx, data.footNote.toUpperCase(), w - MARGIN_X * 2 - 48).slice(0, 2);
    let ny = boxY + 38;
    noteLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X + 24, ny);
      ny += 28;
    });
  }

  drawFooter(ctx, w, h, data.day);
}

// ---- What We're Building slide -----------------------------------------

async function renderBuildingSlide(canvas, data) {
  await ensurePosterFonts();
  const w = SLIDE_W;
  const h = SLIDE_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: `DAY ${pad3(data.day)}`, rightBottom: 'CHALLENGE' });

  let y = 190;
  ctx.font = '700 22px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  drawTracked(ctx, "WHAT WE'RE BUILDING", MARGIN_X, y, { tracking: 2 });
  y += 54;

  const headlineFont = fitFontSize(ctx, data.headline || '', w - MARGIN_X * 2, { start: 54, min: 32, weight: 700 });
  ctx.font = `700 ${headlineFont}px "Space Grotesk"`;
  ctx.fillStyle = PAPER;
  const headLines = wrapText(ctx, (data.headline || '').toUpperCase(), w - MARGIN_X * 2).slice(0, 2);
  headLines.forEach((line) => {
    ctx.fillText(line, MARGIN_X, y);
    y += headlineFont + 8;
  });
  y += 26;

  if (data.description) {
    ctx.font = '400 24px Inter';
    ctx.fillStyle = '#c9c9c9';
    const lines = wrapText(ctx, data.description, w - MARGIN_X * 2).slice(0, 4);
    lines.forEach((line) => {
      ctx.fillText(line, MARGIN_X, y);
      y += 34;
    });
    y += 30;
  }

  // Simple browser-chrome mockup as a visual placeholder for the build.
  const boxTop = y;
  const boxH = h - 230 - boxTop;
  ctx.strokeStyle = 'rgba(244,242,238,0.35)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(MARGIN_X, boxTop, w - MARGIN_X * 2, boxH);
  ctx.fillStyle = 'rgba(244,242,238,0.06)';
  ctx.fillRect(MARGIN_X, boxTop, w - MARGIN_X * 2, 44);
  ['#7a4b4b', '#7a774b', '#4b7a55'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(MARGIN_X + 22 + i * 22, boxTop + 22, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  const skelX = MARGIN_X + 32;
  let sy = boxTop + 90;
  ctx.fillStyle = 'rgba(244,242,238,0.5)';
  ctx.fillRect(skelX, sy, 260, 28);
  sy += 48;
  ctx.fillStyle = 'rgba(244,242,238,0.18)';
  ctx.fillRect(skelX, sy, w - MARGIN_X * 2 - 64, 18);
  sy += 30;
  ctx.fillRect(skelX, sy, (w - MARGIN_X * 2 - 64) * 0.7, 18);
  sy += 46;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(skelX, sy, 150, 40);

  drawFooter(ctx, w, h, data.day);
}

// ---- Individual step slide (one of six) -----------------------------------

async function renderStepSlide(canvas, data) {
  await ensurePosterFonts();
  const w = SLIDE_W;
  const h = SLIDE_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: `DAY ${pad3(data.day)}`, rightBottom: 'CHALLENGE' });

  let y = 190;
  ctx.font = '700 22px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  drawTracked(ctx, 'HOW TO BUILD IT', MARGIN_X, y, { tracking: 2 });
  y += 70;

  const stepCount = data.stepCount || 6;
  const stepLabel = `STEP ${data.stepIndex} `;
  texturedFill(ctx, w, h, (octx) => {
    octx.fillStyle = PAPER;
    octx.font = '700 74px "Space Grotesk"';
    octx.textAlign = 'left';
    octx.fillText(stepLabel, MARGIN_X, y);
  }, { alpha: 0.4 });

  ctx.font = '700 74px "Space Grotesk"';
  const stepLabelW = ctx.measureText(stepLabel).width;
  ctx.font = '600 34px "Space Grotesk"';
  ctx.fillStyle = STEEL;
  ctx.fillText(`OF ${stepCount}`, MARGIN_X + stepLabelW, y);

  y += 40;
  // progress dots
  const dotGap = 22;
  for (let i = 0; i < stepCount; i += 1) {
    ctx.fillStyle = i < data.stepIndex ? ACCENT : 'rgba(244,242,238,0.25)';
    ctx.beginPath();
    ctx.arc(MARGIN_X + i * dotGap, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  y += 70;

  const titleFont = fitFontSize(ctx, data.title || '', w - MARGIN_X * 2, { start: 46, min: 28, weight: 700 });
  ctx.font = `700 ${titleFont}px "Space Grotesk"`;
  ctx.fillStyle = PAPER;
  const titleLines = wrapText(ctx, data.title || '', w - MARGIN_X * 2).slice(0, 3);
  titleLines.forEach((line) => {
    ctx.fillText(line, MARGIN_X, y);
    y += titleFont + 10;
  });
  y += 36;

  if (data.detail) {
    const boxTop = y;
    const boxH = 160;
    ctx.fillStyle = 'rgba(244,242,238,0.06)';
    ctx.fillRect(MARGIN_X, boxTop, w - MARGIN_X * 2, boxH);
    ctx.strokeStyle = 'rgba(244,242,238,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(MARGIN_X, boxTop, w - MARGIN_X * 2, boxH);

    ctx.font = '400 24px "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = ACCENT;
    const detailLines = wrapText(ctx, data.detail, w - MARGIN_X * 2 - 56).slice(0, 4);
    let dy = boxTop + 48;
    detailLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X + 28, dy);
      dy += 34;
    });
  }

  drawFooter(ctx, w, h, data.day);
}

// ---- Community challenge episode (recurring series prompting OTHER
// surveyors to share their own stories, e.g. "Put Yourself On The Map") ----

function pad2(n) {
  return String(Math.max(0, parseInt(n, 10) || 0)).padStart(2, '0');
}

async function renderEpisodeSlide(canvas, data) {
  await ensurePosterFonts();
  const w = SLIDE_W;
  const h = SLIDE_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);
  drawHeader(ctx, w, { rightTop: `EP. ${pad2(data.episodeIndex)}`, rightBottom: 'CHALLENGE' });

  let y = 190;
  ctx.font = '700 22px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  drawTracked(ctx, (data.series || 'PUT YOURSELF ON THE MAP').toUpperCase(), MARGIN_X, y, { tracking: 2 });
  y += 34;

  if (data.arc) {
    ctx.font = '600 19px "Space Grotesk"';
    ctx.fillStyle = STEEL;
    const arcLines = wrapText(ctx, data.arc, w - MARGIN_X * 2).slice(0, 2);
    arcLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X, y);
      y += 26;
    });
  }
  y += 30;

  const titleFont = fitFontSize(ctx, data.title || '', w - MARGIN_X * 2, { start: 64, min: 36, weight: 700 });
  texturedFill(ctx, w, h, (octx) => {
    octx.fillStyle = PAPER;
    octx.font = `700 ${titleFont}px "Space Grotesk"`;
    octx.textAlign = 'left';
    octx.textBaseline = 'alphabetic';
    const lines = wrapText(octx, (data.title || '').toUpperCase(), w - MARGIN_X * 2).slice(0, 2);
    let ty = y + titleFont * 0.85;
    lines.forEach((line) => {
      octx.fillText(line, MARGIN_X, ty);
      ty += titleFont + 8;
    });
  }, { alpha: 0.42 });

  const titleLineCount = Math.min(2, wrapText(ctx, (data.title || '').toUpperCase(), w - MARGIN_X * 2).length || 1);
  y += titleLineCount * (titleFont + 8) + 30;

  const boxH = 200;
  const boxTop = h - 58 - 26 - 40 - boxH;

  if (data.prompt) {
    ctx.font = '400 25px Inter';
    const promptLines = wrapText(ctx, data.prompt, w - MARGIN_X * 2).slice(0, 6);
    const blockH = promptLines.length * 35;
    const available = boxTop - 40 - y;
    if (available > blockH) y += (available - blockH) / 2;

    ctx.fillStyle = '#d8d8d8';
    promptLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X, y);
      y += 35;
    });
  }

  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(MARGIN_X, boxTop, w - MARGIN_X * 2, boxH);

  if (data.hook) {
    ctx.font = '700 30px "Space Grotesk"';
    ctx.fillStyle = PAPER;
    const hookLines = wrapText(ctx, data.hook.toUpperCase(), w - MARGIN_X * 2 - 48).slice(0, 2);
    let hy = boxTop + 48;
    hookLines.forEach((line) => {
      ctx.fillText(line, MARGIN_X + 24, hy);
      hy += 36;
    });
  }

  ctx.font = '600 20px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  const hashtag = data.hashtag || '#PutYourselfOnTheMap';
  ctx.fillText(`Share your story. Tag @GeoTechieX. ${hashtag}`, MARGIN_X + 24, boxTop + boxH - 28);

  drawFooter(ctx, w, h, `/ EP. ${pad2(data.episodeIndex)} OF ${pad2(data.episodeCount || data.episodeIndex)}`, {
    center: hashtag.toUpperCase(),
  });
}

// ---- Open Graph / social share card (1200x630 landscape) ------------------

async function renderOGCard(canvas, data = {}) {
  await ensurePosterFonts();
  const w = OG_W;
  const h = OG_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  paintBackground(ctx, w, h);

  const cx = 74;
  drawLogoMark(ctx, cx, 96, 22);
  ctx.font = '600 26px "Space Grotesk"';
  ctx.fillStyle = PAPER;
  ctx.textAlign = 'left';
  drawTracked(ctx, 'GEOTECHIEX', cx + 36, 104, { tracking: 2 });

  const wordmarkFont = fitFontSize(ctx, 'GEOTECHIEX', w - MARGIN_X * 2, { start: 130, min: 70 });
  texturedFill(ctx, w, h, (octx) => {
    octx.fillStyle = PAPER;
    octx.font = `700 ${wordmarkFont}px "Space Grotesk"`;
    octx.textAlign = 'left';
    octx.textBaseline = 'alphabetic';
    octx.fillText('GEOTECHIEX', MARGIN_X, 280);
  }, { alpha: 0.45 });

  ctx.font = '600 30px "Space Grotesk"';
  ctx.fillStyle = ACCENT;
  const tagline = data.tagline || 'REGISTERED SURVEYOR & GEOSPATIAL DEVELOPER';
  ctx.fillText(tagline.toUpperCase(), MARGIN_X, 336);

  ctx.font = '400 24px Inter';
  ctx.fillStyle = '#c9c9c9';
  const sub = data.subline || 'Open-source geospatial tools, AI assistants, and automation, built live in public on TikTok.';
  const subLines = wrapText(ctx, sub, w - MARGIN_X * 2).slice(0, 2);
  let sy = 386;
  subLines.forEach((line) => {
    ctx.fillText(line, MARGIN_X, sy);
    sy += 32;
  });

  ctx.font = '600 20px "Space Grotesk"';
  ctx.fillStyle = STEEL;
  drawTracked(ctx, 'SURVEYING  •  GIS  •  WEB DEV  •  AI ASSISTANTS  •  AUTOMATION  •  DEVOPS', MARGIN_X, h - 56, { tracking: 1 });

  return canvas;
}

window.BFZPoster = {
  DAY_W,
  DAY_H,
  SLIDE_W,
  SLIDE_H,
  OG_W,
  OG_H,
  pad3,
  ensurePosterFonts,
  renderDayPoster,
  renderQuoteSlide,
  renderListSlide,
  renderBuildingSlide,
  renderStepSlide,
  renderEpisodeSlide,
  renderOGCard,
};
