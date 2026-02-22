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

    // Handle RSVP form submission
    const rsvpForm = document.querySelector('.rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Mocking a successful submission
            alert('Thank you! Your RSVP has been received.');
            rsvpForm.reset();
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
});
