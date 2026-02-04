// Sticky Header
const header = document.getElementById('main-header');
const toggleBtn = document.querySelector('.header__toggle');
const nav = document.querySelector('.header__nav');
const menu = document.querySelector('.header__menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
});

// Smooth Scrolling & Active Link Highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.header__link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Offset for header height
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
             nav.classList.remove('open');
        }
    });
});

// Header CTA Visibility Logic
const heroCta = document.getElementById('hero-cta');
const headerCta = document.querySelector('.header__cta');

if (heroCta && headerCta) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Hero CTA is visible -> Hide Header CTA
                headerCta.classList.remove('visible');
            } else {
                // Hero CTA is NOT visible -> Show Header CTA
                headerCta.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(heroCta);
}
