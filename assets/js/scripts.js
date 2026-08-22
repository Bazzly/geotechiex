document.addEventListener('admin-unlocked', initScripts, { once: true });

function initScripts() {
  const SCRIPTS_KEY = 'bfz_scripts';

  function loadStoredScripts() {
    try {
      const raw = localStorage.getItem(SCRIPTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredScripts() {
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
  }

  const seed = (window.BFZScripts && window.BFZScripts.SCRIPT_SEED) || {};
  const scripts = { ...seed, ...loadStoredScripts() };

  // ---- current challenge context, pulled from Community Series -------------

  const currentArc = (typeof COMMUNITY_SERIES !== 'undefined' && COMMUNITY_SERIES.length)
    ? [...COMMUNITY_SERIES].sort((a, b) => b.order - a.order)[0]
    : null;

  const episodeSelect = document.getElementById('s-episode-ref');

  if (currentArc) {
    document.getElementById('cc-empty').classList.add('hidden');
    document.getElementById('cc-body').classList.remove('hidden');
    document.getElementById('cc-arc-title').textContent = currentArc.arcTitle || currentArc.seriesName;
    document.getElementById('cc-arc-hook').textContent = currentArc.arcHook || '';
    document.getElementById('cc-hashtag').textContent = currentArc.hashtag || '';

    (currentArc.episodes || []).forEach((ep) => {
      const opt = document.createElement('option');
      opt.value = ep.title;
      opt.textContent = ep.title;
      episodeSelect.appendChild(opt);
    });
  }

  // ---- scene list editor -----------------------------------------------------

  const sceneContainer = document.getElementById('scene-items');
  const sceneAddBtn = document.getElementById('scene-add');

  function addSceneRow(values = {}) {
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-start list-row';

    const visual = document.createElement('input');
    visual.type = 'text';
    visual.className = 'flex-1 bg-transparent border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder-paper/30 focus:outline-none focus:border-accent';
    visual.placeholder = "What's shown on screen";
    visual.dataset.field = 'visual';
    if (values.visual) visual.value = values.visual;

    const line = document.createElement('input');
    line.type = 'text';
    line.className = 'flex-1 bg-transparent border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder-paper/30 focus:outline-none focus:border-accent';
    line.placeholder = 'Voiceover / on-screen text';
    line.dataset.field = 'line';
    if (values.line) line.value = values.line;

    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'shrink-0 text-paper/40 hover:text-red-400 px-2 py-2 text-sm';
    rm.textContent = '✕';
    rm.addEventListener('click', () => row.remove());

    row.append(visual, line, rm);
    sceneContainer.appendChild(row);
  }

  sceneAddBtn.addEventListener('click', () => addSceneRow());

  function getScenes() {
    return Array.from(sceneContainer.children)
      .map((row) => ({
        visual: row.querySelector('[data-field="visual"]').value.trim(),
        line: row.querySelector('[data-field="line"]').value.trim(),
      }))
      .filter((s) => s.visual || s.line);
  }

  function setScenes(items) {
    sceneContainer.innerHTML = '';
    (items || []).forEach((s) => addSceneRow(s));
  }

  // ---- apply / gather the form ------------------------------------------------

  const dayInput = document.getElementById('s-day');
  const statusEl = document.getElementById('script-status');

  function applyScript(day, { statusMessage } = {}) {
    const script = scripts[day] || scripts[String(day)];
    if (!script) {
      setScenes([]);
      document.getElementById('s-hook').value = '';
      document.getElementById('s-relatable').value = '';
      document.getElementById('s-cta').value = '';
      document.getElementById('s-caption').value = '';
      document.getElementById('s-hashtags').value = '';
      episodeSelect.value = '';
      statusEl.textContent = statusMessage || `No saved script for Day ${String(day).padStart(3, '0')} yet. Fill it in below, or generate one with AI.`;
      return false;
    }

    document.getElementById('s-hook').value = script.hook || '';
    document.getElementById('s-relatable').value = script.relatable || '';
    document.getElementById('s-cta').value = script.cta || '';
    document.getElementById('s-caption').value = script.caption || '';
    document.getElementById('s-hashtags').value = (script.hashtags || []).join(', ');
    episodeSelect.value = script.episodeRef || '';
    setScenes(script.scenes);

    statusEl.textContent = statusMessage || `Loaded the saved script for Day ${String(day).padStart(3, '0')}.`;
    return true;
  }

  function nextDefaultDay() {
    const savedDays = Object.keys(scripts).map((d) => parseInt(d, 10)).filter((d) => !Number.isNaN(d));
    const maxSaved = savedDays.length ? Math.max(...savedDays) : 0;
    const maxLog = (typeof BUILD_LOG !== 'undefined' && BUILD_LOG.length)
      ? Math.max(...BUILD_LOG.map((e) => e.day || 0))
      : 0;
    return Math.max(maxSaved, maxLog, 0) + 1;
  }

  dayInput.value = nextDefaultDay();
  applyScript(parseInt(dayInput.value, 10) || 1, {
    statusMessage: `No saved script for Day ${String(dayInput.value).padStart(3, '0')} yet. Fill it in below, or generate one with AI.`,
  });

  dayInput.addEventListener('change', () => applyScript(parseInt(dayInput.value, 10) || 1));

  // ---- save ----------------------------------------------------------------

  function currentFormData() {
    const day = parseInt(dayInput.value, 10) || 1;
    const hashtags = document.getElementById('s-hashtags').value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      day,
      episodeRef: episodeSelect.value,
      hook: document.getElementById('s-hook').value.trim(),
      relatable: document.getElementById('s-relatable').value.trim(),
      scenes: getScenes(),
      cta: document.getElementById('s-cta').value.trim(),
      caption: document.getElementById('s-caption').value.trim(),
      hashtags,
    };
  }

  function renderSavedList() {
    const listEl = document.getElementById('saved-scripts-list');
    const days = Object.keys(scripts).map((d) => parseInt(d, 10)).filter((d) => !Number.isNaN(d)).sort((a, b) => b - a);

    if (!days.length) {
      listEl.innerHTML = '<p class="text-sm text-paper/50">No scripts saved yet.</p>';
      return;
    }

    listEl.innerHTML = '';
    days.forEach((day) => {
      const script = scripts[day];
      const card = document.createElement('div');
      card.className = 'border border-line rounded-lg p-4';

      const head = document.createElement('div');
      head.className = 'flex items-center justify-between mb-2';
      const dayLabel = document.createElement('span');
      dayLabel.className = 'font-display font-bold text-accent text-xs tracking-widest';
      dayLabel.textContent = `DAY ${String(day).padStart(3, '0')}`;
      head.appendChild(dayLabel);

      const preview = document.createElement('p');
      preview.className = 'text-sm text-paper/70 leading-relaxed line-clamp-2';
      preview.textContent = script.hook || '(no hook yet)';

      const actions = document.createElement('div');
      actions.className = 'flex gap-3 mt-3';

      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'text-accent text-xs font-semibold hover:underline';
      loadBtn.textContent = 'Load';
      loadBtn.addEventListener('click', () => {
        dayInput.value = day;
        applyScript(day);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'text-paper/40 text-xs font-semibold hover:text-red-400';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        delete scripts[day];
        saveStoredScripts();
        renderSavedList();
      });

      actions.append(loadBtn, delBtn);
      card.append(head, preview, actions);
      listEl.appendChild(card);
    });
  }

  document.getElementById('script-save').addEventListener('click', () => {
    const data = currentFormData();
    scripts[data.day] = data;
    saveStoredScripts();
    renderSavedList();
    statusEl.textContent = `Saved Day ${String(data.day).padStart(3, '0')} in this browser.`;
  });

  renderSavedList();

  // ---- copy full script as clean text for filming ----------------------------

  document.getElementById('script-copy-full').addEventListener('click', async () => {
    const data = currentFormData();
    const sceneLines = data.scenes
      .map((s, i) => `${i + 1}. [${s.visual || '...'}]\n   ${s.line || '...'}`)
      .join('\n\n');

    const text = `DAY ${String(data.day).padStart(3, '0')}${data.episodeRef ? ` — ${data.episodeRef}` : ''}

HOOK
${data.hook}

WHY IT'S RELATABLE
${data.relatable}

SCENES
${sceneLines}

CTA
${data.cta}

CAPTION
${data.caption}

HASHTAGS
${data.hashtags.join(' ')}`;

    await navigator.clipboard.writeText(text);
    const btn = document.getElementById('script-copy-full');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  // ---- AI prompt, tied to brand voice + current challenge ---------------------

  function buildScriptPrompt(day, notes) {
    const example = window.BFZScripts.SCRIPT_SEED[1];
    const arcContext = currentArc
      ? `CURRENT COMMUNITY CHALLENGE: "${currentArc.seriesName}" (${currentArc.hashtag}), arc "${currentArc.arcTitle}", hook: "${currentArc.arcHook}".`
      + (episodeSelect.value ? ` This video is specifically about the episode "${episodeSelect.value}".` : ' Tie the video to this arc in general, since no specific episode was chosen.')
      : 'No community challenge arc is published yet, write a standalone script instead.';

    return `You are writing the script for a short-form daily video (TikTok/Reels/Shorts) for GeoTechieX, a brand for Bazeet, a registered surveyor, DevOps engineer, and web/geospatial developer with 8+ years of experience, building open-source geospatial tools, AI assistants, and automation live in public.

AUDIENCE: a mix of working surveyors, tech/dev people, and the general public who have no idea what actually goes into land surveying. Every script must be relatable to BOTH: something a surveyor immediately recognizes as real, AND something a total outsider can follow and find surprising or interesting.

BRAND VOICE: minimal, technical, documentary, no hype, no fake growth-hacking, no "overnight success" claims. Direct, honest, a little understated. Show the actual work, not a polished highlight reel.

${arcContext}
${notes ? `Additional notes from the author: ${notes}` : ''}

TASK: Write day ${String(day).padStart(3, '0')}'s video script as a single JSON object.

OUTPUT FORMAT: Return ONLY a single valid JSON object, no commentary, no markdown fences, matching this exact shape (this is Day 1's real, already-published content, given purely as a format reference; write a NEW script, don't reuse it):

${JSON.stringify(example, null, 2)}

FIELD RULES:
- "hook": one or two sentences, the first thing said or shown, must stop the scroll in under 2 seconds. Concrete and specific, never a generic question like "Did you know...".
- "relatable": one sentence naming exactly why the audience sees themselves in this moment.
- "scenes": 4 to 8 items, each ONE short, filmable beat, in order. "visual": what's on screen. "line": the voiceover or on-screen text for that beat, short enough to read/say in 2-4 seconds.
- "cta": one line, tells the viewer exactly what to do next (follow for the next day, comment their own story, join the WhatsApp group, etc).
- "caption": ready to paste as the post caption, 1-3 sentences plus a couple of the hashtags inline.
- "hashtags": 3 to 6 tags, "#PutYourselfOnTheMap" first if this ties to the current challenge.

Return only the JSON object.`;
  }

  document.getElementById('script-ai-build').addEventListener('click', () => {
    const day = parseInt(dayInput.value, 10) || 1;
    const notes = document.getElementById('script-ai-notes').value.trim();
    document.getElementById('script-ai-out').value = buildScriptPrompt(day, notes);
  });

  document.getElementById('script-ai-copy').addEventListener('click', async () => {
    const out = document.getElementById('script-ai-out');
    if (!out.value) return;
    await navigator.clipboard.writeText(out.value);
    const btn = document.getElementById('script-ai-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1200);
  });

  // ---- import script JSON: paste or upload -------------------------------------

  const importStatus = document.getElementById('script-import-status');
  const importInput = document.getElementById('script-import-input');

  // Accepts one script object, or an array of them (e.g. when the AI writes
  // several days at once). Each entry is saved straight into the per-day
  // store, keyed by its own "day" (falling back to the day currently in the
  // form if an entry has none), exactly like "Import Day Plan(s)" does.
  function saveScriptEntry(entry) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const day = entry.day || parseInt(dayInput.value, 10) || 1;
    scripts[day] = {
      day,
      episodeRef: entry.episodeRef || '',
      hook: entry.hook || '',
      relatable: entry.relatable || '',
      scenes: Array.isArray(entry.scenes) ? entry.scenes : [],
      cta: entry.cta || '',
      caption: entry.caption || '',
      hashtags: Array.isArray(entry.hashtags) ? entry.hashtags : [],
    };
    return day;
  }

  document.getElementById('script-import-btn').addEventListener('click', () => {
    const raw = importInput.value.trim();
    if (!raw) {
      importStatus.textContent = 'Paste JSON first, or use the file upload below.';
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      const savedDays = entries.map(saveScriptEntry).filter((d) => d !== null);

      if (savedDays.length) {
        saveStoredScripts();
        renderSavedList();
        const lastDay = Math.max(...savedDays);
        dayInput.value = lastDay;
        applyScript(lastDay);
        importStatus.textContent = `Imported ${savedDays.length} script${savedDays.length === 1 ? '' : 's'} (Day${savedDays.length === 1 ? '' : 's'} ${savedDays.map((d) => String(d).padStart(3, '0')).join(', ')}). Loaded Day ${String(lastDay).padStart(3, '0')} below for review.`;
        importInput.value = '';
      } else {
        importStatus.textContent = "That JSON parsed fine, but didn't look like a script, nothing imported.";
      }
    } catch (e) {
      importStatus.textContent = `Couldn't parse that JSON: ${e.message}`;
    }
  });

  document.getElementById('script-import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importInput.value = await file.text();
    document.getElementById('script-import-btn').click();
    e.target.value = '';
  });

  // ---- export all saved scripts -------------------------------------------------

  document.getElementById('scripts-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(scripts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geotechiex-scripts-export.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
