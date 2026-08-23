document.addEventListener('admin-unlocked', initDaily, { once: true });

function initDaily() {
  const P = window.BFZPoster;
  const DP = window.BFZDayPlans;

  // ---- Day number default: one past the latest Build Log entry ----------
  const dayInput = document.getElementById('f-day');
  if (typeof BUILD_LOG !== 'undefined' && BUILD_LOG.length) {
    const maxDay = Math.max(...BUILD_LOG.map((e) => e.day || 0));
    dayInput.value = maxDay + 1;
  } else {
    dayInput.value = 1;
  }

  const logDateInput = document.getElementById('f-log-date');
  if (logDateInput && !logDateInput.value) {
    logDateInput.value = new Date().toISOString().slice(0, 10);
  }

  // ---- current arc, read from the published Community Series data (not a
  // form field, since the Arc Builder now lives on its own page) -----------

  const currentArc = (typeof COMMUNITY_SERIES !== 'undefined' && COMMUNITY_SERIES.length)
    ? [...COMMUNITY_SERIES].sort((a, b) => b.order - a.order)[0]
    : null;

  // ---- day plan store: seed + anything imported, kept in localStorage ----
  const PLANS_KEY = 'bfz_day_plans';

  function loadStoredPlans() {
    try {
      const raw = localStorage.getItem(PLANS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredPlans() {
    localStorage.setItem(PLANS_KEY, JSON.stringify(dayPlans));
  }

  const dayPlans = { ...DP.DAY_PLANS_SEED, ...loadStoredPlans() };

  // ---- apply a day plan to every field on the form -----------------------

  const planStatus = document.getElementById('day-plan-status');

  function applyDayPlan(day, { statusMessage } = {}) {
    const plan = dayPlans[day] || dayPlans[String(day)];
    if (!plan) {
      if (planStatus) {
        planStatus.textContent = statusMessage
          || `No saved plan for Day ${P.pad3(day)} yet. Type a quote below, or generate/import one.`;
      }
      return false;
    }

    document.getElementById('f-quote').value = plan.quote || '';
    document.getElementById('f-highlight').value = plan.highlight || '';
    document.getElementById('f-tagline').value = plan.tagline || '';
    document.getElementById('f-focus').value = (plan.focusLines || []).join('\n');

    document.getElementById('f-log-title').value = (plan.log && plan.log.title) || '';
    document.getElementById('f-log-summary').value = (plan.log && plan.log.summary) || '';
    document.getElementById('f-log-tags').value = (plan.log && plan.log.tags ? plan.log.tags.join(', ') : '');

    if (planStatus) planStatus.textContent = statusMessage || `Loaded the saved plan for Day ${P.pad3(day)}.`;
    return true;
  }

  dayInput.addEventListener('change', () => applyDayPlan(parseInt(dayInput.value, 10) || 1));

  // First load: use the plan for the current day if one exists, otherwise
  // fall back to the Day 1 template so the form is never blank.
  const initialDay = parseInt(dayInput.value, 10) || 1;
  if (!applyDayPlan(initialDay)) {
    applyDayPlan(1, {
      statusMessage: `No saved plan for Day ${P.pad3(initialDay)} — showing the Day 1 template as a starting point. Edit it freely, or import a real one below.`,
    });
  }

  // ---- quiet auto-save: typing into Quote/Log fields saves in the background,
  // no visible import/export step needed just to not lose today's work --------

  let autoSaveTimer = null;
  function autoSaveQuote() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      const day = parseInt(dayInput.value, 10) || 1;
      const tags = document.getElementById('f-log-tags').value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      dayPlans[day] = {
        day,
        quote: document.getElementById('f-quote').value.trim(),
        highlight: document.getElementById('f-highlight').value.trim(),
        tagline: document.getElementById('f-tagline').value.trim(),
        focusLines: focusLines(),
        log: {
          title: document.getElementById('f-log-title').value.trim(),
          summary: document.getElementById('f-log-summary').value.trim(),
          tags,
        },
      };
      saveStoredPlans();
    }, 500);
  }

  ['f-quote', 'f-highlight', 'f-tagline', 'f-focus', 'f-log-title', 'f-log-summary', 'f-log-tags'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', autoSaveQuote);
  });

  // ---- shared data getters -------------------------------------------------

  function baseData() {
    return {
      day: parseInt(dayInput.value, 10) || 1,
      quote: document.getElementById('f-quote').value.trim(),
      highlight: document.getElementById('f-highlight').value.trim(),
      tagline: document.getElementById('f-tagline').value.trim(),
    };
  }

  function focusLines() {
    return document
      .getElementById('f-focus')
      .value.split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  const { addGalleryCard, freshCanvas } = window.BFZGallery.initGallery('gallery');
  const dayLabel = () => P.pad3(baseData().day);

  // ---- single-slide generate buttons -----------------------------------

  document.getElementById('gen-poster').addEventListener('click', async () => {
    const c = freshCanvas();
    await P.renderDayPoster(c, { ...baseData(), focusLines: focusLines() });
    addGalleryCard(c, `day-${dayLabel()}-poster.png`, `Day ${dayLabel()} — Poster`);
  });

  document.getElementById('gen-quote').addEventListener('click', async () => {
    const c = freshCanvas();
    await P.renderQuoteSlide(c, baseData());
    addGalleryCard(c, `day-${dayLabel()}-quote.png`, `Day ${dayLabel()} — Quote`);
  });

  // ---- Build Log snippet helper -------------------------------------------

  const snippetOut = document.getElementById('log-snippet-out');

  document.getElementById('log-snippet-generate').addEventListener('click', () => {
    const day = baseData().day;
    const date = document.getElementById('f-log-date').value || new Date().toISOString().slice(0, 10);
    const title = document.getElementById('f-log-title').value.trim();
    const summary = document.getElementById('f-log-summary').value.trim();
    const tags = document
      .getElementById('f-log-tags')
      .value.split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    snippetOut.value = `  {
    day: ${day},
    date: '${date}',
    title: '${esc(title)}',
    summary: '${esc(summary)}',
    tags: [${tags.map((t) => `'${esc(t)}'`).join(', ')}],
  },`;
  });

  document.getElementById('log-snippet-copy').addEventListener('click', async () => {
    if (!snippetOut.value) return;
    await navigator.clipboard.writeText(snippetOut.value);
    const btn = document.getElementById('log-snippet-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  // ---- import day plan(s): paste JSON or upload a file --------------------

  const importStatus = document.getElementById('import-status');
  const importInput = document.getElementById('import-json-input');

  function mergePlans(parsed) {
    let count = 0;
    function addOne(obj) {
      if (obj && typeof obj === 'object' && obj.day) {
        dayPlans[obj.day] = obj;
        count += 1;
      }
    }
    if (Array.isArray(parsed)) {
      parsed.forEach(addOne);
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.day) addOne(parsed);
      else Object.values(parsed).forEach(addOne);
    }
    if (count > 0) saveStoredPlans();
    return count;
  }

  document.getElementById('import-json-btn').addEventListener('click', () => {
    const raw = importInput.value.trim();
    if (!raw) {
      importStatus.textContent = 'Paste JSON first, or use the file upload below.';
      return;
    }
    try {
      const count = mergePlans(JSON.parse(raw));
      if (count > 0) {
        importStatus.textContent = `Imported ${count} day plan${count === 1 ? '' : 's'}. Saved in this browser.`;
        importInput.value = '';
        applyDayPlan(parseInt(dayInput.value, 10) || 1);
      } else {
        importStatus.textContent = 'That JSON parsed fine, but no entries had a "day" field — nothing imported.';
      }
    } catch (e) {
      importStatus.textContent = `Couldn't parse that JSON: ${e.message}`;
    }
  });

  document.getElementById('import-json-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importInput.value = await file.text();
    document.getElementById('import-json-btn').click();
    e.target.value = '';
  });

  document.getElementById('export-plans-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(dayPlans, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'day-plans-export.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---- AI prompt for today's quote, tied to the current published arc -------

  function buildQuotePrompt(day, notes) {
    const example = DP.DAY_PLANS_SEED[1];
    const arcContext = currentArc
      ? `This quote runs alongside the current "${currentArc.seriesName}" arc: "${currentArc.arcTitle}" (hook: "${currentArc.arcHook}"). The quote should feel like it belongs to the same story, not a disconnected motivational line. It can reference surveying, fieldwork, code, or discipline in general, whatever fits, as long as it doesn't contradict the arc's tone.`
      : 'No Community Series arc is currently published, write a standalone quote instead.';

    return `You are writing the daily motivational quote for GeoTechieX, a brand for Bazeet, a registered surveyor, DevOps engineer, and web/geospatial developer with 8+ years of experience, building open-source geospatial tools, AI assistants, and automation live in public on TikTok.

BRAND VOICE: minimal, technical, documentary, no hype, no fake growth-hacking, no "overnight success" claims. Direct, honest, a little understated.

CONTEXT: ${arcContext}
${notes ? `Additional notes from the author: ${notes}` : ''}

TASK: Write day ${P.pad3(day)}'s quote plan as a single JSON object, to feed into the Day Poster and Quote Slide image generator.

OUTPUT FORMAT: Return ONLY a single valid JSON object, no commentary, no markdown fences, matching this exact shape (this is Day 1's real, already-published content, given purely as a format reference; write a NEW quote, don't reuse it):

${JSON.stringify(example, null, 2)}

FIELD RULES:
- "day": the integer ${day}.
- "quote": one punchy, original sentence in the brand voice. Not a famous or copyrighted quote, write an original line.
- "highlight": one word or short phrase copied verbatim FROM the quote, to render in accent blue.
- "tagline": short signature line (variants on "Registered surveyor & DevOps engineer..." are fine).
- "focusLines": exactly 3 short imperative lines, what today is about.
- "log.title": short past-tense summary for the public build log. "log.summary": 1-2 sentences. "log.tags": 2-3 short tags.

Return only the JSON object.`;
  }

  document.getElementById('quote-ai-build').addEventListener('click', () => {
    const day = parseInt(dayInput.value, 10) || 1;
    const notes = document.getElementById('quote-ai-notes').value.trim();
    document.getElementById('quote-ai-out').value = buildQuotePrompt(day, notes);
  });

  document.getElementById('quote-ai-copy').addEventListener('click', async () => {
    const out = document.getElementById('quote-ai-out');
    if (!out.value) return;
    await navigator.clipboard.writeText(out.value);
    const btn = document.getElementById('quote-ai-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });
}
