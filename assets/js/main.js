document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

navToggle.addEventListener('click', () => {
  const isOpen = !mobileNav.classList.contains('hidden');
  mobileNav.classList.toggle('hidden');
  navToggle.setAttribute('aria-expanded', String(!isOpen));
});

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.add('hidden');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Header background on scroll
const header = document.getElementById('site-header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// FAQ accordion
document.querySelectorAll('.faq-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const panel = trigger.parentElement.querySelector('.faq-panel');
    const expanded = trigger.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-trigger').forEach((other) => {
      if (other !== trigger) {
        other.setAttribute('aria-expanded', 'false');
        other.parentElement.querySelector('.faq-panel').classList.add('hidden');
      }
    });

    trigger.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('hidden', expanded);
  });
});

// Pre-fill the service dropdown when a "Get this" link is clicked
const serviceSelect = document.getElementById('service');
document.querySelectorAll('.service-link').forEach((link) => {
  link.addEventListener('click', () => {
    const service = link.getAttribute('data-service');
    if (service) serviceSelect.value = service;
  });
});

// Contact form -> opens a pre-filled email (no backend required)
// Only present on pages that include the contact section (currently index.html).
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const service = form.service.value;
    const message = form.message.value.trim();

    const subject = `New project inquiry: ${service}`;
    const body = `Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`;

    window.location.href = `mailto:geotechiex@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = 'Opening your email client to send this message...';
  });
}
