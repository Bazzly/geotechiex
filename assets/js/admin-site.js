document.addEventListener('admin-unlocked', initSite, { once: true });

function initSite() {
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
}
