function seriesEpisodeItem(ep, index) {
  const num = String(index + 1).padStart(2, '0');
  return `
    <li class="flex gap-4 py-4 border-b border-line last:border-b-0">
      <span class="font-display font-bold text-accent text-sm shrink-0 pt-0.5">${num}</span>
      <div>
        <p class="font-display font-semibold text-paper">${ep.title}</p>
        <p class="mt-1 text-sm text-paper/65 leading-relaxed">${ep.prompt}</p>
      </div>
    </li>
  `;
}

function currentArcCard(arc) {
  const episodes = (arc.episodes || []).map(seriesEpisodeItem).join('');
  return `
    <div class="border border-accent/40 rounded-2xl p-6 sm:p-10 bg-ink">
      <span class="inline-flex items-center gap-2 text-accent text-xs font-display font-bold uppercase tracking-[0.2em] border border-accent/40 rounded-full px-3 py-1.5">
        Current Challenge
      </span>
      <h2 class="mt-5 font-display font-bold text-2xl sm:text-4xl uppercase tracking-tight">${arc.seriesName}</h2>
      <p class="mt-1 text-accent text-sm font-semibold">${arc.hashtag}</p>
      <p class="mt-5 text-lg sm:text-xl text-paper font-display font-semibold">${arc.arcTitle}</p>
      <p class="mt-2 text-paper/70">${arc.arcHook}</p>
      <ul class="mt-8">${episodes}</ul>
    </div>
  `;
}

function pastArcCard(arc) {
  return `
    <div class="border border-line rounded-lg p-6 bg-ink">
      <span class="text-xs uppercase tracking-wide text-steel">Past Series</span>
      <h3 class="mt-2 font-display font-semibold text-lg">${arc.seriesName}</h3>
      <p class="mt-1 text-xs text-paper/50">${arc.hashtag}</p>
      <p class="mt-3 text-sm text-paper/65 leading-relaxed">${arc.arcTitle}</p>
      <p class="mt-3 text-xs text-steel">${(arc.episodes || []).length} episodes</p>
    </div>
  `;
}

function renderSeries() {
  if (typeof COMMUNITY_SERIES === 'undefined' || !COMMUNITY_SERIES.length) return;
  const sorted = [...COMMUNITY_SERIES].sort((a, b) => b.order - a.order);
  const [current, ...past] = sorted;

  const currentEl = document.getElementById('series-current');
  if (currentEl && current) currentEl.innerHTML = currentArcCard(current);

  const pastSection = document.getElementById('series-past-section');
  const pastEl = document.getElementById('series-past');
  if (pastEl) {
    if (past.length) {
      pastEl.innerHTML = past.map(pastArcCard).join('');
    } else if (pastSection) {
      pastSection.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', renderSeries);
