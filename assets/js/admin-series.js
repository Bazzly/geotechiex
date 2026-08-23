document.addEventListener('admin-unlocked', initSeries, { once: true });

function initSeries() {
  const P = window.BFZPoster;

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

  const { addGalleryCard, freshCanvas } = window.BFZGallery.initGallery('gallery');

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
