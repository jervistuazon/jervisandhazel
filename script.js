document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');
    const navbar = document.getElementById('navbar');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const scatterPhotos = document.querySelectorAll('.scatter-photo');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navItems.forEach((item) => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    if (navbar && !navbar.hasAttribute('data-static-scrolled')) {
        const updateNavbar = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        };

        updateNavbar();
        window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach((element) => {
            revealObserver.observe(element);
        });

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const id = entry.target.getAttribute('id');
                if (!id || !entry.isIntersecting) {
                    return;
                }

                navItems.forEach((link) => {
                    const matches = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('is-active', matches);
                });
            });
        }, {
            threshold: 0.45,
            rootMargin: '-20% 0px -30% 0px'
        });

        document.querySelectorAll('section[id]').forEach((section) => {
            sectionObserver.observe(section);
        });
    } else {
        animatedElements.forEach((element) => {
            element.classList.add('is-visible');
        });
    }

    if (scatterPhotos.length > 0) {
        scatterPhotos.forEach((photo) => {
            photo.addEventListener('touchstart', function () {
                scatterPhotos.forEach((item) => item.classList.remove('mobile-active'));
                this.classList.add('mobile-active');
            }, { passive: true });

            photo.addEventListener('touchend', function () {
                this.classList.remove('mobile-active');
            }, { passive: true });

            photo.addEventListener('touchcancel', function () {
                this.classList.remove('mobile-active');
            }, { passive: true });
        });

        document.addEventListener('touchstart', (event) => {
            if (!event.target.classList.contains('scatter-photo')) {
                scatterPhotos.forEach((photo) => photo.classList.remove('mobile-active'));
            }
        }, { passive: true });
    }

});
