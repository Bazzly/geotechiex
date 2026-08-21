function portfolioCard(project) {
  return `
    <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="border border-line rounded-lg bg-ink p-8 flex flex-col group">
      <h3 class="font-display font-semibold text-lg">${project.name}</h3>
      <p class="mt-3 text-sm text-paper/65 leading-relaxed flex-1">${project.description}</p>
      <span class="mt-6 inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">View project <span aria-hidden="true">&rarr;</span></span>
    </a>
  `;
}

function renderPortfolio() {
  if (typeof PORTFOLIO === 'undefined') return;
  const sorted = [...PORTFOLIO].sort((a, b) => b.order - a.order);

  const preview = document.getElementById('portfolio-preview');
  if (preview) preview.innerHTML = sorted.slice(0, 3).map(portfolioCard).join('');

  const full = document.getElementById('portfolio-full');
  if (full) full.innerHTML = sorted.map(portfolioCard).join('');

  document.querySelectorAll('[data-portfolio-count]').forEach((el) => {
    el.textContent = `${sorted.length} ${sorted.length === 1 ? 'project' : 'projects'}`;
  });
}

document.addEventListener('DOMContentLoaded', renderPortfolio);
