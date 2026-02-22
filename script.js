document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

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

    // Handle RSVP form submission with Web3Forms
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpMessage = document.getElementById('rsvpMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(rsvpForm);
            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    rsvpMessage.innerText = "Thank you! Your RSVP has been received.";
                    rsvpMessage.style.display = "block";
                    rsvpMessage.style.color = "var(--navy)";
                    rsvpForm.reset();
                } else {
                    rsvpMessage.innerText = "Something went wrong. Please try again.";
                    rsvpMessage.style.display = "block";
                    rsvpMessage.style.color = "red";
                }
            } catch (error) {
                rsvpMessage.innerText = "Error sending message. Please try again.";
                rsvpMessage.style.display = "block";
                rsvpMessage.style.color = "red";
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    rsvpMessage.style.display = "none";
                }, 5000);
            }
        });
    }

    // Modal Logic for Registry
    const modal = document.getElementById("registryModal");
    const btn = document.getElementById("openRegistryModal");
    const span = document.querySelector(".close-modal");

    if (btn && modal && span) {
        // Open modal
        btn.addEventListener("click", () => {
            modal.style.display = "flex";
            // Slight delay to allow display flex to apply before opacity transition
            setTimeout(() => {
                modal.classList.add("show");
            }, 10);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        });

        // Close modal (X button)
        span.addEventListener("click", () => {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }, 300); // match CSS transition duration
        });

        // Close modal (clicking outside content)
        window.addEventListener("click", (event) => {
            if (event.target == modal) {
                modal.classList.remove("show");
                setTimeout(() => {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                }, 300);
            }
        });
    }

    // Add scroll effect for navbar
    const navbar = document.getElementById('navbar');
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

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
    });

    // Initial call for mobile styling
    if (window.innerWidth <= 768) {
        navbar.style.padding = '15px 20px';
    }

    // Handle mobile touch events for scatter photos
    const scatterPhotos = document.querySelectorAll('.scatter-photo');

    scatterPhotos.forEach(photo => {
        // When touched, make it fully pop over the text
        photo.addEventListener('touchstart', function (e) {
            // Remove active class from all other photos first
            scatterPhotos.forEach(p => p.classList.remove('mobile-active'));
            // Add to the one being touched
            this.classList.add('mobile-active');
        }, { passive: true });

        // Revert back when touch is released
        photo.addEventListener('touchend', function (e) {
            this.classList.remove('mobile-active');
        }, { passive: true });

        photo.addEventListener('touchcancel', function (e) {
            this.classList.remove('mobile-active');
        }, { passive: true });
    });

    // Tap anywhere else on the document to dismiss the photo popup
    document.addEventListener('touchstart', function (e) {
        if (!e.target.classList.contains('scatter-photo')) {
            scatterPhotos.forEach(p => p.classList.remove('mobile-active'));
        }
    }, { passive: true });

});
