/*
 * Shared generated-image gallery: used by both the Daily Content page (Day
 * Poster / Quote Slide) and the Community Series page (episode images),
 * each with its own #gallery container on its own page.
 */
function initGallery(containerId) {
  const gallery = document.getElementById(containerId);

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

  const clearBtn = document.getElementById('gallery-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Array.from(gallery.querySelectorAll('img')).forEach((img) => URL.revokeObjectURL(img.src));
      gallery.innerHTML = '';
    });
  }

  const downloadAllBtn = document.getElementById('gallery-download-all');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', () => {
      const links = Array.from(gallery.querySelectorAll('a.gallery-download'));
      links.forEach((a, i) => setTimeout(() => a.click(), i * 150));
    });
  }

  return { addGalleryCard, freshCanvas };
}

window.BFZGallery = { initGallery };
