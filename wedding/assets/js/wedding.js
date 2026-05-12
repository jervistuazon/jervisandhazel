const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');
const prevImage = document.getElementById('prevImage');
const nextImage = document.getElementById('nextImage');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxCaption = document.getElementById('lightboxCaption');
const hero = document.querySelector('.hero');
const cards = [...document.querySelectorAll('.card')];
const sections = [...document.querySelectorAll('.story, .gallery-wrap, .chapter')];
let activeIndex = 0;

const updateLightbox = (index) => {
  activeIndex = (index + cards.length) % cards.length;
  const card = cards[activeIndex];
  lightboxImage.src = card.dataset.full;
  lightboxImage.alt = card.querySelector('img')?.alt || 'Expanded gallery preview';
  lightboxCounter.textContent = `${activeIndex + 1} / ${cards.length}`;
  lightboxCaption.textContent = card.dataset.caption || '';
};

cards.forEach((card, index) => {
  card.addEventListener('click', () => {
    updateLightbox(index);
    lightbox.showModal();
  });
});

prevImage.addEventListener('click', () => updateLightbox(activeIndex - 1));
nextImage.addEventListener('click', () => updateLightbox(activeIndex + 1));
closeLightbox.addEventListener('click', () => lightbox.close());

lightbox.addEventListener('click', (event) => {
  const rect = lightbox.getBoundingClientRect();
  const inDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height
    && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
  if (!inDialog) lightbox.close();
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.open && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) return;
  if (event.key === 'Escape' && lightbox.open) lightbox.close();
  if (event.key === 'ArrowRight' && lightbox.open) updateLightbox(activeIndex + 1);
  if (event.key === 'ArrowLeft' && lightbox.open) updateLightbox(activeIndex - 1);
});

const revealTargets = [
  document.querySelector('.story h2'),
  document.querySelector('.story p'),
  document.querySelector('.gallery-wrap h2'),
  document.querySelector('.gallery-lead'),
  ...document.querySelectorAll('.chapter h3'),
  ...cards
].filter(Boolean);

revealTargets.forEach((el, index) => {
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', `${Math.min(index * 35, 320)}ms`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -10% 0px' });

revealTargets.forEach((el) => observer.observe(el));
sections.forEach((section) => {
  section.classList.add('section-transition');
  observer.observe(section);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', targetId);
  });
});

window.addEventListener('scroll', () => {
  if (!hero) return;
  const offset = Math.min(window.scrollY * 0.2, 120);
  hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
}, { passive: true });
