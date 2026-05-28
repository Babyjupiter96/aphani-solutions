// ─── NAV SCROLL ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── HAMBURGER ───
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── ANIMATED COUNTERS ───
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const duration = 1600;
  const step     = 16;
  const inc      = target / (duration / step);
  let current    = 0;

  const fmt = n => {
    const rounded = Math.round(n);
    return prefix + (target >= 1000 ? rounded.toLocaleString() : rounded) + suffix;
  };

  const tick = () => {
    current = Math.min(current + inc, target);
    el.textContent = fmt(current);
    if (current < target) requestAnimationFrame(tick);
  };
  tick();
}

// ─── INTERSECTION OBSERVER ───
const triggered = new Set();

const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !triggered.has(e.target)) {
      triggered.add(e.target);
      animateCounter(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));
document.querySelectorAll('[data-target]').forEach(el => counterIO.observe(el));

// ─── FORMS ───
function wireForm(formId, successId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      const msg = document.getElementById(successId);
      if (msg) msg.style.display = 'block';
      form.reset();
      btn.textContent = orig;
      btn.disabled = false;
    }, 1000);
  });
}

wireForm('contactForm',  'contactSuccess');
wireForm('partnerForm',  'partnerSuccess');
