const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const closeLightbox = document.getElementById('closeLightbox');
const prevImage = document.getElementById('prevImage');
const nextImage = document.getElementById('nextImage');
const hero = document.querySelector('.hero');
const scrollCue = document.querySelector('.scroll-cue');
const galleryGrid = document.getElementById('galleryGrid');
const galleryFilters = document.getElementById('galleryFilters');
const galleryHeading = document.getElementById('galleryHeading');
const galleryStatus = document.getElementById('galleryStatus');
const sections = [...document.querySelectorAll('.story, .gallery-wrap, .chapter')];

const categories = ['All', 'Ceremony', 'Portraits', 'Family', 'Reception', 'Details'];
const galleryAssetVersion = '20260516-1';

// Replace these placeholder URLs with local files later, for example:
// thumb: 'photos/thumbs/photo-001.webp', full: 'photos/full/photo-001.webp'
const galleryPhotos = [
  {
    thumb: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=80',
    alt: 'Wedding ceremony moment',
    caption: 'Ceremony vows',
    category: 'Ceremony',
    size: 'span-2'
  },
  {
    thumb: '../photos/photo-3.webp',
    full: '../photos/photo-3.webp',
    alt: 'Ceremony table details',
    caption: 'Garden details',
    category: 'Details'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2200&q=80',
    alt: 'Couple holding hands',
    caption: 'Hands and promise',
    category: 'Ceremony'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    full: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2200&q=80',
    alt: 'Bride and groom portrait',
    caption: 'Couple portrait',
    category: 'Portraits'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2200&q=80',
    alt: 'Couple outdoors',
    caption: 'After-ceremony walk',
    category: 'Portraits'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=2200&q=80',
    alt: 'Romantic wedding dance',
    caption: 'First dance',
    category: 'Reception'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=2200&q=80',
    alt: 'Wedding cake and floral arrangement',
    caption: 'Cake and florals',
    category: 'Details'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=2200&q=80',
    alt: 'Bridal party celebrating',
    caption: 'Family and friends',
    category: 'Family'
  },
  {
    thumb: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    full: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=80',
    alt: 'Wedding reception with lights',
    caption: 'Evening reception atmosphere',
    category: 'Reception',
    size: 'span-3'
  }
];

let activeCategory = 'All';
let activePhotos = [...galleryPhotos];
let activeIndex = 0;
let swipeStartX = 0;
let swipeStartY = 0;

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.04, rootMargin: '450px 0px 450px 0px' });

const observeReveal = (el, delay = '0ms') => {
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', delay);
  revealObserver.observe(el);
};

const filteredPhotos = () => {
  if (activeCategory === 'All') return [...galleryPhotos];
  return galleryPhotos.filter((photo) => photo.category === activeCategory);
};

const versionedAsset = (src) => {
  if (!src || src.startsWith('data:')) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}v=${galleryAssetVersion}`;
};

const markImageLoaded = (img) => {
  img.closest('.card')?.classList.add('is-loaded');
};

const markImageError = (img) => {
  const card = img.closest('.card');
  if (!card) return;
  card.classList.add('is-loaded', 'is-error');
  card.setAttribute('aria-label', `${img.alt || 'Wedding photo'} is currently unavailable`);
};

const preloadImage = (src) => {
  if (!src) return;
  const preload = new Image();
  preload.decoding = 'async';
  preload.src = versionedAsset(src);
};

const preloadNeighborImages = () => {
  if (!activePhotos.length) return;
  const previous = activePhotos[(activeIndex - 1 + activePhotos.length) % activePhotos.length];
  const next = activePhotos[(activeIndex + 1) % activePhotos.length];
  preloadImage(previous?.full);
  preloadImage(next?.full);
};

const updateStatus = () => {
  if (!galleryStatus) return;
  const label = activeCategory === 'All' ? 'all moments' : activeCategory.toLowerCase();
  galleryStatus.textContent = `${activePhotos.length} ${activePhotos.length === 1 ? 'photo' : 'photos'} showing in ${label}.`;
};

const renderFilters = () => {
  if (!galleryFilters) return;

  galleryFilters.innerHTML = '';
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === activeCategory));

    if (category === activeCategory) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      if (activeCategory === category) return;
      activeCategory = category;
      renderFilters();
      renderGallery();
    });

    galleryFilters.appendChild(button);
  });
};

const createGalleryCard = (photo, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `card ${photo.size || ''}`.trim();
  card.setAttribute('aria-label', `Open ${photo.caption}`);

  const img = document.createElement('img');
  img.src = versionedAsset(photo.thumb);
  img.alt = photo.alt;
  img.decoding = 'async';
  img.loading = index < 6 ? 'eager' : 'lazy';
  img.fetchPriority = index < 3 ? 'high' : 'low';

  img.addEventListener('load', () => markImageLoaded(img), { once: true });
  img.addEventListener('error', () => markImageError(img), { once: true });

  if (img.complete && img.naturalWidth > 0) {
    markImageLoaded(img);
  }

  card.appendChild(img);
  card.addEventListener('click', () => openLightbox(index));
  observeReveal(card);
  return card;
};

const warmGalleryImages = () => {
  galleryGrid?.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      markImageLoaded(img);
    } else if (img.complete) {
      markImageError(img);
    }
  });
};

const renderGallery = () => {
  if (!galleryGrid) return;

  activePhotos = filteredPhotos();
  activeIndex = 0;
  galleryGrid.innerHTML = '';
  galleryHeading.textContent = activeCategory === 'All' ? 'All Photos' : activeCategory;

  activePhotos.forEach((photo, index) => {
    galleryGrid.appendChild(createGalleryCard(photo, index));
  });

  updateStatus();
  warmGalleryImages();
};

const updateLightbox = (index) => {
  if (!activePhotos.length) return;

  activeIndex = (index + activePhotos.length) % activePhotos.length;
  const photo = activePhotos[activeIndex];

  lightbox.classList.remove('is-error');
  lightboxImage.src = versionedAsset(photo.full);
  lightboxImage.alt = photo.alt || 'Expanded gallery preview';
  lightboxCaption.textContent = photo.caption || 'Wedding photo';
  lightboxCounter.textContent = `${activeIndex + 1} / ${activePhotos.length}`;
  preloadNeighborImages();
};

const openLightbox = (index) => {
  updateLightbox(index);
  lightbox.showModal();
};

const closeActiveLightbox = () => {
  lightbox.close();
};

prevImage.addEventListener('click', () => updateLightbox(activeIndex - 1));
nextImage.addEventListener('click', () => updateLightbox(activeIndex + 1));
closeLightbox.addEventListener('click', closeActiveLightbox);

lightboxImage.addEventListener('error', () => {
  lightbox.classList.add('is-error');
  lightboxCaption.textContent = 'This photo is currently unavailable.';
});

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeActiveLightbox();
});

lightbox.addEventListener('pointerdown', (event) => {
  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
});

lightbox.addEventListener('pointerup', (event) => {
  const deltaX = event.clientX - swipeStartX;
  const deltaY = event.clientY - swipeStartY;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
  updateLightbox(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.open && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) return;
  if (event.key === 'Escape' && lightbox.open) closeActiveLightbox();
  if (event.key === 'ArrowRight' && lightbox.open) updateLightbox(activeIndex + 1);
  if (event.key === 'ArrowLeft' && lightbox.open) updateLightbox(activeIndex - 1);
});

[
  document.querySelector('.story h2'),
  document.querySelector('.story p'),
  document.querySelector('.gallery-wrap h2'),
  document.querySelector('.gallery-lead'),
  document.querySelector('.chapter h3'),
  document.querySelector('.gallery-quote')
].filter(Boolean).forEach((el, index) => {
  observeReveal(el, `${Math.min(index * 20, 160)}ms`);
});

sections.forEach((section) => {
  section.classList.add('section-transition');
  revealObserver.observe(section);
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

  if (scrollCue) {
    scrollCue.style.opacity = window.scrollY > 24 ? '0' : '0.78';
    scrollCue.style.transform = window.scrollY > 24 ? 'translateX(-50%) translateY(8px)' : 'translateX(-50%)';
  }
}, { passive: true });

renderFilters();
renderGallery();
