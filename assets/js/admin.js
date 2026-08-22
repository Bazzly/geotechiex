document.addEventListener('admin-unlocked', initAdmin, { once: true });

function initAdmin() {
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

  // ---- generic dynamic list editor ---------------------------------------

  function initListEditor(container, addBtn, fields, { max = 99 } = {}) {
    function addRow(values = {}) {
      if (container.children.length >= max) return;
      const row = document.createElement('div');
      row.className = 'flex gap-2 items-start list-row';

      fields.forEach((f) => {
        const el = document.createElement('input');
        el.type = 'text';
        el.className = 'flex-1 bg-transparent border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder-paper/30 focus:outline-none focus:border-accent';
        el.placeholder = f.placeholder || '';
        el.dataset.field = f.name;
        if (values[f.name]) el.value = values[f.name];
        row.appendChild(el);
      });

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'shrink-0 text-paper/40 hover:text-red-400 px-2 py-2 text-sm';
      rm.textContent = '✕';
      rm.addEventListener('click', () => row.remove());
      row.appendChild(rm);

      container.appendChild(row);
    }

    addBtn.addEventListener('click', () => addRow());

    function getValues() {
      return Array.from(container.children)
        .map((row) => {
          const obj = {};
          fields.forEach((f) => {
            obj[f.name] = row.querySelector(`[data-field="${f.name}"]`).value.trim();
          });
          return obj;
        })
        .filter((o) => Object.values(o).some((v) => v));
    }

    // Accepts an array of strings (single-field lists) or objects, clears
    // the container first. Used when a day plan is loaded/imported.
    function setRows(items) {
      container.innerHTML = '';
      (items || []).forEach((it) => {
        if (typeof it === 'string') {
          addRow({ [fields[0].name]: it });
        } else {
          addRow(it);
        }
      });
    }

    return { addRow, getValues, setRows };
  }

  const episodeList = initListEditor(
    document.getElementById('episode-items'),
    document.getElementById('episode-add'),
    [{ name: 'title', placeholder: 'Episode title' }, { name: 'prompt', placeholder: 'What should the surveyor share?' }],
    { max: 20 },
  );
  [
    ['The Client Call', "Tell the story of the call that kicks it all off. What does the client ask for, and what do you already know you're in for?"],
    ['Sending the Invoice', 'Walk through quoting and invoicing the job. What actually goes into that number?'],
    ['Mobilization Fee Clears', 'The fee lands. Show what happens next: getting the instrument ready and the team briefed.'],
    ['Reconnaissance', 'First trip to site before the real work starts. What are you actually checking for?'],
    ['Clearing the Site', 'Sometimes the site fights back before you even set up. Show what it takes to clear a path.'],
    ['Carrying the Pillar to Site', 'The pillar has to get to site no matter how far or how rough the terrain. Show the trek.'],
    ['Digging the Ground', 'Before a beacon means anything, someone has to dig. Show the physical work most people never see.'],
    ['Observation with the Instrument', 'Show the actual reading: setting up, sighting, and taking the observation that becomes the raw data.'],
    ['Processing the Data', 'Take us from field numbers to something usable. What does that desk work actually look like?'],
    ['Drawing the Plan', 'Show the moment the data becomes a drawing. What\'s the most painstaking part of getting it right?'],
    ['Delivered to the Client', 'Show the handoff. What does the client actually see, and what did they never realize went into it?'],
    ['The Plan in Use', 'Show what happens after delivery: a bank, a lawyer, an engineer, a government office, actually using what you made.'],
  ].forEach(([title, prompt]) => episodeList.addRow({ title, prompt }));

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

  // ---- gallery / download helpers -------------------------------------------

  const gallery = document.getElementById('gallery');

  function addGalleryCard(canvas, filename, label) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const card = document.createElement('div');
      card.className = 'border border-line rounded-lg overflow-hidden bg-ink';

      const img = document.createElement('img');
      img.src = url;
      img.className = 'w-full h-auto block';
      img.alt = label;

      const foot = document.createElement('div');
      foot.className = 'p-3 flex items-center justify-between gap-2';

      const labelEl = document.createElement('span');
      labelEl.className = 'text-xs text-paper/60 truncate';
      labelEl.textContent = label;

      const dl = document.createElement('a');
      dl.href = url;
      dl.download = filename;
      dl.className = 'gallery-download shrink-0 text-accent text-xs font-semibold hover:underline';
      dl.textContent = 'Download';

      foot.append(labelEl, dl);
      card.append(img, foot);
      gallery.prepend(card);
    }, 'image/png');
  }

  function freshCanvas() {
    return document.createElement('canvas');
  }

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

  document.getElementById('gallery-clear').addEventListener('click', () => {
    Array.from(gallery.querySelectorAll('img')).forEach((img) => URL.revokeObjectURL(img.src));
    gallery.innerHTML = '';
  });

  document.getElementById('gallery-download-all').addEventListener('click', () => {
    const links = Array.from(gallery.querySelectorAll('a.gallery-download'));
    links.forEach((a, i) => setTimeout(() => a.click(), i * 150));
  });

  // ---- Live Tools: ready-for-use toggles -----------------------------------

  const TOOLS_KEY = 'bfz_tools_ready';

  function loadToolsReadyOverrides() {
    try {
      const raw = localStorage.getItem(TOOLS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveToolsReadyOverrides(overrides) {
    localStorage.setItem(TOOLS_KEY, JSON.stringify(overrides));
  }

  if (typeof LIVE_TOOLS !== 'undefined') {
    const toolsListEl = document.getElementById('tools-ready-list');
    const toolsOverrides = loadToolsReadyOverrides();

    const isToolReady = (tool) => (Object.prototype.hasOwnProperty.call(toolsOverrides, tool.id)
      ? toolsOverrides[tool.id]
      : tool.ready);

    if (toolsListEl) {
      LIVE_TOOLS.forEach((tool) => {
        const row = document.createElement('label');
        row.className = 'flex items-center justify-between gap-3 border border-paper/15 rounded-md px-3 py-2.5 cursor-pointer';

        const name = document.createElement('span');
        name.className = 'text-sm text-paper';
        name.textContent = tool.name;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-4 h-4 accent-accent';
        checkbox.checked = isToolReady(tool);
        checkbox.addEventListener('change', () => {
          toolsOverrides[tool.id] = checkbox.checked;
          saveToolsReadyOverrides(toolsOverrides);
        });

        row.append(name, checkbox);
        toolsListEl.appendChild(row);
      });
    }

    const toolsSnippetOut = document.getElementById('tools-snippet-out');

    document.getElementById('tools-snippet-generate').addEventListener('click', () => {
      const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const entries = LIVE_TOOLS.map((tool) => `  {
    id: '${tool.id}',
    name: '${esc(tool.name)}',
    description: '${esc(tool.description)}',
    url: '${tool.url}',
    ready: ${isToolReady(tool) ? 'true' : 'false'},
  },`).join('\n');
      const header = '// The Live Tools list. Each tool needs ready: true before it shows as\n'
        + '// clickable on the homepage; toggle readiness from the admin Content Studio.\n';
      toolsSnippetOut.value = `${header}const LIVE_TOOLS = [\n${entries}\n];\n`;
    });

    document.getElementById('tools-snippet-copy').addEventListener('click', async () => {
      if (!toolsSnippetOut.value) return;
      await navigator.clipboard.writeText(toolsSnippetOut.value);
      const btn = document.getElementById('tools-snippet-copy');
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  }

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
    const snippet = `  {
    day: ${day},
    date: '${date}',
    title: '${esc(title)}',
    summary: '${esc(summary)}',
    tags: [${tags.map((t) => `'${esc(t)}'`).join(', ')}],
  },`;
    snippetOut.value = snippet;
  });

  document.getElementById('log-snippet-copy').addEventListener('click', async () => {
    if (!snippetOut.value) return;
    await navigator.clipboard.writeText(snippetOut.value);
    const btn = document.getElementById('log-snippet-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  // ---- Portfolio snippet helper ---------------------------------------------

  if (typeof PORTFOLIO !== 'undefined') {
    const portfolioSnippetOut = document.getElementById('portfolio-snippet-out');

    document.getElementById('portfolio-snippet-generate').addEventListener('click', () => {
      const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const name = document.getElementById('f-portfolio-name').value.trim();
      const description = document.getElementById('f-portfolio-description').value.trim();
      const url = document.getElementById('f-portfolio-url').value.trim();
      const nextOrder = PORTFOLIO.length
        ? Math.max(...PORTFOLIO.map((p) => p.order || 0)) + 1
        : 1;

      portfolioSnippetOut.value = `  {
    order: ${nextOrder},
    name: '${esc(name)}',
    description: '${esc(description)}',
    url: '${url}',
  },`;
    });

    document.getElementById('portfolio-snippet-copy').addEventListener('click', async () => {
      if (!portfolioSnippetOut.value) return;
      await navigator.clipboard.writeText(portfolioSnippetOut.value);
      const btn = document.getElementById('portfolio-snippet-copy');
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  }

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

  // ---- AI prompt for today's quote, tied to the current arc -----------------

  function buildQuotePrompt(day, notes) {
    const series = document.getElementById('f-series-name').value.trim() || 'Put Yourself On The Map';
    const arc = document.getElementById('f-arc-title').value.trim();
    const hook = document.getElementById('f-arc-hook').value.trim();
    const example = DP.DAY_PLANS_SEED[1];

    return `You are writing the daily motivational quote for GeoTechieX, a brand for Bazeet, a registered surveyor, DevOps engineer, and web/geospatial developer with 8+ years of experience, building open-source geospatial tools, AI assistants, and automation live in public on TikTok.

BRAND VOICE: minimal, technical, documentary, no hype, no fake growth-hacking, no "overnight success" claims. Direct, honest, a little understated.

CONTEXT: This quote runs alongside the current "${series}" arc: "${arc}" (hook: "${hook}"). The quote should feel like it belongs to the same story, not a disconnected motivational line. It can reference surveying, fieldwork, code, or discipline in general, whatever fits, as long as it doesn't contradict the arc's tone.
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

  // ---- Surveyor Challenge: episode images ---------------------------------

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'episode';
  }

  document.getElementById('gen-episodes').addEventListener('click', async () => {
    const series = document.getElementById('f-series-name').value.trim();
    const hashtag = document.getElementById('f-series-hashtag').value.trim();
    const arc = document.getElementById('f-arc-title').value.trim();
    const hook = document.getElementById('f-arc-hook').value.trim();
    const episodes = episodeList.getValues();

    for (let i = 0; i < episodes.length; i += 1) {
      const c = freshCanvas();
      // eslint-disable-next-line no-await-in-loop
      await P.renderEpisodeSlide(c, {
        series,
        hashtag,
        arc,
        hook,
        episodeIndex: i + 1,
        episodeCount: episodes.length,
        title: episodes[i].title,
        prompt: episodes[i].prompt,
      });
      addGalleryCard(c, `episode-${String(i + 1).padStart(2, '0')}-${slugify(episodes[i].title)}.png`, `Episode ${i + 1} — ${episodes[i].title}`);
    }
  });

  // ---- Future Arcs Roadmap: admin-only planning, never touches the public site --

  const ROADMAP_STATUS_KEY = 'bfz_roadmap_status';
  const STATUS_VALUES = ['planned', 'pre_augmented', 'ready', 'current', 'archived'];

  function loadRoadmapStatusOverrides() {
    try {
      const raw = localStorage.getItem(ROADMAP_STATUS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveRoadmapStatusOverrides(overrides) {
    localStorage.setItem(ROADMAP_STATUS_KEY, JSON.stringify(overrides));
  }

  if (typeof ROADMAP_SEED !== 'undefined') {
    const roadmapListEl = document.getElementById('roadmap-list');
    const statusOverrides = loadRoadmapStatusOverrides();

    const arcStatus = (arc) => statusOverrides[arc.arcId] || arc.status;

    function setArcStatus(arc, status) {
      if (status === 'current') {
        ROADMAP_SEED.forEach((other) => {
          if (other.arcId !== arc.arcId && arcStatus(other) === 'current') {
            statusOverrides[other.arcId] = 'archived';
          }
        });
      }
      statusOverrides[arc.arcId] = status;
      saveRoadmapStatusOverrides(statusOverrides);
    }

    function loadArcIntoBuilder(arc) {
      document.getElementById('f-arc-title').value = arc.arcTitle;
      document.getElementById('f-arc-hook').value = arc.arcHook;
      episodeList.setRows(arc.episodes);
    }

    function renderRoadmap() {
      roadmapListEl.innerHTML = '';
      const sorted = [...ROADMAP_SEED].sort((a, b) => a.seasonOrder - b.seasonOrder);

      sorted.forEach((arc) => {
        const status = arcStatus(arc);
        const row = document.createElement('div');
        row.className = 'border border-paper/15 rounded-md p-3';

        const head = document.createElement('div');
        head.className = 'flex items-start justify-between gap-3';

        const titleBlock = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'text-sm text-paper font-semibold';
        title.textContent = `${String(arc.seasonOrder).padStart(2, '0')} — ${arc.arcTitle}`;
        const hook = document.createElement('p');
        hook.className = 'text-xs text-paper/50 mt-0.5';
        hook.textContent = `${arc.arcHook} (${arc.episodes.length} episodes)`;
        titleBlock.append(title, hook);

        const select = document.createElement('select');
        select.className = 'shrink-0 bg-ink border border-paper/20 rounded-md px-2 py-1 text-xs text-paper focus:outline-none focus:border-accent';
        STATUS_VALUES.forEach((v) => {
          const opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v.replace('_', ' ');
          if (v === status) opt.selected = true;
          select.appendChild(opt);
        });
        select.addEventListener('change', () => {
          setArcStatus(arc, select.value);
          renderRoadmap();
        });

        head.append(titleBlock, select);

        const loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'text-accent text-xs font-semibold hover:underline mt-2';
        loadBtn.textContent = 'Load into Builder';
        loadBtn.addEventListener('click', () => {
          loadArcIntoBuilder(arc);
          document.getElementById('f-arc-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        row.append(head, loadBtn);
        roadmapListEl.appendChild(row);
      });
    }

    renderRoadmap();
  }

  // ---- Community Series: publish snippet ------------------------------------

  if (typeof COMMUNITY_SERIES !== 'undefined') {
    const seriesSnippetOut = document.getElementById('series-snippet-out');

    document.getElementById('series-snippet-generate').addEventListener('click', () => {
      const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const seriesName = document.getElementById('f-series-name').value.trim();
      const hashtag = document.getElementById('f-series-hashtag').value.trim();
      const arcTitle = document.getElementById('f-arc-title').value.trim();
      const arcHook = document.getElementById('f-arc-hook').value.trim();
      const episodes = episodeList.getValues();
      const nextOrder = COMMUNITY_SERIES.length
        ? Math.max(...COMMUNITY_SERIES.map((a) => a.order || 0)) + 1
        : 1;

      const episodeLines = episodes
        .map((ep) => `      { title: '${esc(ep.title)}', prompt: '${esc(ep.prompt)}' },`)
        .join('\n');

      seriesSnippetOut.value = `  {
    order: ${nextOrder},
    seriesName: '${esc(seriesName)}',
    hashtag: '${esc(hashtag)}',
    arcTitle: '${esc(arcTitle)}',
    arcHook: '${esc(arcHook)}',
    episodes: [
${episodeLines}
    ],
  },`;
    });

    document.getElementById('series-snippet-copy').addEventListener('click', async () => {
      if (!seriesSnippetOut.value) return;
      await navigator.clipboard.writeText(seriesSnippetOut.value);
      const btn = document.getElementById('series-snippet-copy');
      const original = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  }

  // ---- Surveyor Challenge: AI prompt for a new arc -------------------------

  function buildEpisodeAIPrompt(topic) {
    const series = document.getElementById('f-series-name').value.trim() || 'Put Yourself On The Map';
    const hashtag = document.getElementById('f-series-hashtag').value.trim() || '#PutYourselfOnTheMap';
    const exampleArc = {
      arc: document.getElementById('f-arc-title').value.trim(),
      hook: document.getElementById('f-arc-hook').value.trim(),
      episodes: episodeList.getValues(),
    };

    return `You are writing a new arc (batch of episodes) for "${series}" (${hashtag}), a recurring community challenge run by GeoTechieX, a brand for Bazeet, a registered surveyor, DevOps engineer, and web/geospatial developer.

WHAT THIS SERIES IS: each episode is a short, punchy DIRECTIVE aimed at OTHER surveyors, prompting them to film or write about one specific, physical, relatable moment from their own work, then post it publicly tagged with the hashtag. GeoTechieX is not telling its own story here; it's giving other surveyors something concrete and easy to respond to. The goal is content that's relatable to working surveyors AND understandable to the general public, who mostly have no idea what actually goes into a survey job.

TONE: minimal, technical, documentary, no hype. Concrete and physical, not corporate. Think "show the struggle," not "share your journey."

TASK: Write ONE new arc: a short run of episodes (5 to 10) that walks through a single connected process or theme in a surveyor's work, moment by moment, the way a TV season has episodes. ${topic ? `The topic for this arc: ${topic}` : "Pick a topic surveyors will immediately recognize and the public will find surprising, e.g. boundary disputes, working in the rain, rejected plans, dealing with difficult land owners, night reconnaissance, or anything else concretely tied to real survey work."}

OUTPUT FORMAT: Return ONLY a single valid JSON object — no commentary, no markdown fences — matching this shape (this is the current example arc, given purely as a format reference; write a NEW arc on a different topic, don't reuse it):

${JSON.stringify(exampleArc, null, 2)}

FIELD RULES:
- "arc": short, concrete title for the theme of this batch, e.g. "How We Get Each Point on a Survey Plan".
- "hook": one short punchy line that ties every episode in the arc together, shown on every episode image.
- "episodes": 5 to 10 items, each strictly in order, each covering ONE distinct, physical, filmable moment (not an abstract idea). Each item:
  - "title": 2-5 words, concrete, e.g. "Digging the Ground".
  - "prompt": one or two sentences, written as a direct instruction to the surveyor reading it (second person), telling them what specific moment or story to share. Never write it as if GeoTechieX is answering it themselves.

Return only the JSON object.`;
  }

  document.getElementById('episode-ai-build').addEventListener('click', () => {
    const topic = document.getElementById('episode-ai-topic').value.trim();
    document.getElementById('episode-ai-out').value = buildEpisodeAIPrompt(topic);
  });

  document.getElementById('episode-ai-copy').addEventListener('click', async () => {
    const out = document.getElementById('episode-ai-out');
    if (!out.value) return;
    await navigator.clipboard.writeText(out.value);
    const btn = document.getElementById('episode-ai-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  // ---- Surveyor Challenge: import an arc from AI JSON ----------------------

  document.getElementById('episode-import-btn').addEventListener('click', () => {
    const raw = document.getElementById('episode-import-input').value.trim();
    const statusEl = document.getElementById('episode-import-status');
    if (!raw) {
      statusEl.textContent = 'Paste JSON first.';
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const episodes = Array.isArray(parsed.episodes) ? parsed.episodes : [];
      if (!episodes.length) {
        statusEl.textContent = 'That JSON parsed fine, but had no "episodes" array — nothing imported.';
        return;
      }
      if (parsed.arc) document.getElementById('f-arc-title').value = parsed.arc;
      if (parsed.hook) document.getElementById('f-arc-hook').value = parsed.hook;
      episodeList.setRows(episodes);
      statusEl.textContent = `Imported ${episodes.length} episode(s) into the arc above.`;
      document.getElementById('episode-import-input').value = '';
    } catch (e) {
      statusEl.textContent = `Couldn't parse that JSON: ${e.message}`;
    }
  });
}
