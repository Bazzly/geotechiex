/*
 * Soft client-side gate. This is NOT real security: the passphrase
 * lives in this file, visible to anyone who views source. It only
 * keeps casual visitors out of an unlinked page.
 *
 * For real protection, use your host's access control instead —
 * e.g. Vercel/Netlify password protection or Cloudflare Access in
 * front of this URL — and treat this as a convenience lock on top.
 *
 * Change this before you rely on it for anything.
 */
const ADMIN_PASSPHRASE = 'geotechiex180';

(function gate() {
  const SESSION_KEY = 'bfz_admin_unlocked';
  const gateEl = document.getElementById('admin-gate');
  const panelEl = document.getElementById('admin-panel');
  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-password');
  const errorEl = document.getElementById('gate-error');
  const lockBtn = document.getElementById('lock-btn');

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, '1');
    gateEl.classList.add('hidden');
    panelEl.classList.remove('hidden');
    document.dispatchEvent(new CustomEvent('admin-unlocked'));
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    gateEl.classList.remove('hidden');
    panelEl.classList.add('hidden');
    if (input) input.value = '';
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    // Deferred: this script runs before admin.js's listener is registered,
    // so unlocking synchronously here would fire 'admin-unlocked' before
    // anyone is listening. Defer to the next tick, after all scripts on
    // the page have finished loading and registering their listeners.
    setTimeout(unlock, 0);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === ADMIN_PASSPHRASE) {
      errorEl.textContent = '';
      unlock();
    } else {
      errorEl.textContent = 'Incorrect passphrase.';
      form.reset();
      input.focus();
    }
  });

  if (lockBtn) lockBtn.addEventListener('click', lock);
})();
