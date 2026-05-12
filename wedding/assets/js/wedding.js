const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');
const hero = document.querySelector('.hero');
const scrollCue = document.querySelector('.scroll-cue');
const cards = [...document.querySelectorAll('.card')];

for (const card of cards) {
  card.addEventListener('click', () => {
    lightboxImage.src = card.dataset.full;
    lightbox.showModal();
  });
}

closeLightbox.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  const rect = lightbox.getBoundingClientRect();
  const inDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height
    && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
  if (!inDialog) lightbox.close();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.open) lightbox.close();
});

const revealTargets = [
  document.querySelector('.story h2'),
  document.querySelector('.story p'),
  document.querySelector('.gallery-wrap h2'),
  document.querySelector('.gallery-lead'),
  ...cards
].filter(Boolean);

revealTargets.forEach((el, index) => {
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', `${Math.min(index * 40, 400)}ms`);
});

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

revealTargets.forEach((el) => observer.observe(el));

window.addEventListener('scroll', () => {
  if (!hero) return;
  const offset = Math.min(window.scrollY * 0.2, 120);
  hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;

  if (scrollCue) {
    scrollCue.style.opacity = window.scrollY > 24 ? '0' : '0.78';
    scrollCue.style.transform = window.scrollY > 24 ? 'translateX(-50%) translateY(8px)' : 'translateX(-50%)';
  }
}, { passive: true });
