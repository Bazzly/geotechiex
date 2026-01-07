const mobileMenuButton = document.getElementById('mobile-menu-button');
// support multiple possible IDs (older markup used different names)
const mobileMenu = document.getElementById('mobile-menu-dropdown') || document.getElementById('mobile-menu');

function closeMobileMenu(){
  if(!mobileMenu || mobileMenu.classList.contains('hidden')) return;
  mobileMenu.classList.add('hidden');
  mobileMenu.classList.remove('flex');
  if(mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
}

if(mobileMenuButton){
  // accessibility
  mobileMenuButton.setAttribute('aria-controls', mobileMenu ? (mobileMenu.id || 'mobile-menu') : 'mobile-menu');
  mobileMenuButton.setAttribute('aria-expanded', 'false');

  mobileMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if(!mobileMenu) return;
    const isHidden = mobileMenu.classList.contains('hidden');
    if(isHidden){
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('flex');
      mobileMenu.classList.add('flex-col');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
    } else {
      closeMobileMenu();
    }
  });

  // close when clicking outside
  document.addEventListener('click', function(e){
    if(!mobileMenu) return;
    if(e.target.closest && (!e.target.closest('#mobile-menu-dropdown') && !e.target.closest('#mobile-menu') && !e.target.closest('#mobile-menu-button'))){
      closeMobileMenu();
    }
  });

  // close on ESC
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMobileMenu(); });
}

// Remove or disable broken local .html links to avoid 404s.
(async function removeBrokenLinks(){
  try{
    const anchors = Array.from(document.querySelectorAll('a[href$=".html"]'));
    await Promise.all(anchors.map(async a=>{
      const href = a.getAttribute('href');
      if(!href) return;
      if(href.startsWith('http') || href.startsWith('#')) return;
      try{
        const res = await fetch(href, { method: 'HEAD' });
        if(!res.ok) throw new Error('not found');
      }catch(e){
        // remove parent card if possible, otherwise disable link
        const card = a.closest('.bg-white') || a.closest('.rounded-xl') || a.closest('[class*="shadow"]') || a.closest('div');
        if(card && card.parentElement){
          card.remove();
        } else {
          a.classList.add('missing-link');
          a.setAttribute('aria-disabled', 'true');
          a.removeAttribute('href');
        }
      }
    }));
  }catch(err){
    console.warn('removeBrokenLinks failed', err);
  }
})();