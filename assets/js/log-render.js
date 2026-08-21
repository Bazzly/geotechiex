function formatLogDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function logEntryCard(entry) {
  const dayLabel = String(entry.day).padStart(3, '0');
  const tags = (entry.tags || [])
    .map((tag) => `<span class="text-xs uppercase tracking-wide text-steel border border-line rounded-full px-3 py-1">${tag}</span>`)
    .join('');

  return `
    <article class="border border-line rounded-lg p-6 bg-ink flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <span class="font-display font-bold text-accent text-sm tracking-widest">DAY ${dayLabel}</span>
        <span class="text-xs text-steel">${formatLogDate(entry.date)}</span>
      </div>
      <h3 class="font-display font-semibold text-lg">${entry.title}</h3>
      <p class="mt-2 text-sm text-paper/65 leading-relaxed flex-1">${entry.summary}</p>
      ${tags ? `<div class="mt-4 flex flex-wrap gap-2">${tags}</div>` : ''}
    </article>
  `;
}

function renderLog() {
  const sorted = [...BUILD_LOG].sort((a, b) => b.day - a.day);

  const preview = document.getElementById('log-preview');
  if (preview) {
    preview.innerHTML = sorted.slice(0, 3).map(logEntryCard).join('');
  }

  const full = document.getElementById('log-full');
  if (full) {
    full.innerHTML = sorted.map(logEntryCard).join('');
  }

  const countEls = document.querySelectorAll('[data-log-count]');
  countEls.forEach((el) => {
    el.textContent = `${sorted.length} ${sorted.length === 1 ? 'day' : 'days'}`;
  });
}

document.addEventListener('DOMContentLoaded', renderLog);
