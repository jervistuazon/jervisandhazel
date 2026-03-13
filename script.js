document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Handle RSVP form submission with Web3Forms
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpMessage = document.getElementById('rsvpMessage');

    if (rsvpForm && rsvpMessage) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(rsvpForm);
            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Send RSVP';

            if (submitBtn) {
                submitBtn.innerText = 'Sending...';
                submitBtn.disabled = true;
            }

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    rsvpMessage.innerText = 'Thank you! Your RSVP has been received.';
                    rsvpMessage.style.display = 'block';
                    rsvpMessage.style.color = 'var(--navy)';
                    rsvpForm.reset();
                } else {
                    rsvpMessage.innerText = 'Something went wrong. Please try again.';
                    rsvpMessage.style.display = 'block';
                    rsvpMessage.style.color = 'red';
                }
            } catch (error) {
                rsvpMessage.innerText = 'Error sending message. Please try again.';
                rsvpMessage.style.display = 'block';
                rsvpMessage.style.color = 'red';
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }

                setTimeout(() => {
                    rsvpMessage.style.display = 'none';
                }, 5000);
            }
        });
    }

    // Add scroll effect for navbar
    const navbar = document.getElementById('navbar');

    if (navbar && !navbar.hasAttribute('data-static-scrolled')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');

                // Mobile adjustments
                if (window.innerWidth <= 768) {
                    navbar.style.padding = '15px 20px';
                } else {
                    navbar.style.padding = ''; // Reset to default
                }
            }
        });

        // Initial call for mobile styling
        if (window.innerWidth <= 768) {
            navbar.style.padding = '15px 20px';
        }
    }

    // Scroll animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach((el) => {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach((el) => {
            el.classList.add('is-visible');
        });
    }

    // Handle mobile touch events for scatter photos
    const scatterPhotos = document.querySelectorAll('.scatter-photo');

    if (scatterPhotos.length > 0) {
        scatterPhotos.forEach(photo => {
            // When touched, make it fully pop over the text
            photo.addEventListener('touchstart', function () {
                // Remove active class from all other photos first
                scatterPhotos.forEach(p => p.classList.remove('mobile-active'));
                // Add to the one being touched
                this.classList.add('mobile-active');
            }, { passive: true });

            // Revert back when touch is released
            photo.addEventListener('touchend', function () {
                this.classList.remove('mobile-active');
            }, { passive: true });

            photo.addEventListener('touchcancel', function () {
                this.classList.remove('mobile-active');
            }, { passive: true });
        });

        // Tap anywhere else on the document to dismiss the photo popup
        document.addEventListener('touchstart', function (e) {
            if (!e.target.classList.contains('scatter-photo')) {
                scatterPhotos.forEach(p => p.classList.remove('mobile-active'));
            }
        }, { passive: true });
    }
});
