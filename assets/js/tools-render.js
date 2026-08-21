function toolCard(tool) {
  if (tool.ready) {
    return `
      <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="bg-ink p-8 flex flex-col group">
        <h3 class="font-display font-semibold text-lg">${tool.name}</h3>
        <p class="mt-3 text-sm text-paper/65 leading-relaxed flex-1">${tool.description}</p>
        <span class="mt-6 inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">Try it <span aria-hidden="true">&rarr;</span></span>
      </a>
    `;
  }

  return `
    <div class="bg-ink p-8 flex flex-col opacity-60">
      <h3 class="font-display font-semibold text-lg">${tool.name}</h3>
      <p class="mt-3 text-sm text-paper/65 leading-relaxed flex-1">${tool.description}</p>
      <span class="mt-6 inline-flex items-center gap-1 text-steel text-sm font-semibold">Coming soon</span>
    </div>
  `;
}

function renderTools() {
  const grid = document.getElementById('live-tools-grid');
  if (!grid || typeof LIVE_TOOLS === 'undefined') return;
  grid.innerHTML = LIVE_TOOLS.map(toolCard).join('');
}

document.addEventListener('DOMContentLoaded', renderTools);
