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
const mobileMenu = document.getElementById('mobile-menu');
if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

// Smooth Scrolling & Active Link Highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.header__link');

// Active Link Highlighting based on URL
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.header__link');

    navLinks.forEach(link => {
        // Remove hardcoded active class to avoid conflicts, logic will set it
        link.classList.remove('active');

        const href = link.getAttribute('href');

        // Exact match
        if (href === currentPath) {
            link.classList.add('active');
        }
        // Handle root path / resolving to index.html
        else if ((currentPath === '' || currentPath === '/') && href === 'index.html') {
            link.classList.add('active');
        }
    });
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            nav.classList.remove('open');
        }
    });
});

// Header CTA Visibility Logic - DISABLED (User wants button always visible)
/*
const heroCta = document.getElementById('hero-cta');
const headerCta = document.querySelector('.header__cta');

if (heroCta && headerCta) {
    // Index page - show when hero CTA is out of view
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
} else if (headerCta) {
    // Other pages - show on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            headerCta.classList.add('visible');
        } else {
            headerCta.classList.remove('visible');
        }
    });
}
*/

// Cookie Consent Logic
document.addEventListener('DOMContentLoaded', () => {
    const COOKIE_STORAGE_KEY = 'wildero_cookie_consent';

    // Check if user already consented
    const existingConsent = localStorage.getItem(COOKIE_STORAGE_KEY);

    if (!existingConsent) {
        showCookieBanner();
    }

    function showCookieBanner() {
        // Inject HTML
        const bannerHTML = `
            <div class="cookie-banner" id="cookie-banner">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <strong>Používáme cookies</strong> 🍪<br>
                        Aby Wildero fungovalo správně a mohli jsme ho zlepšovat, potřebujeme ukládat malé soubory cookies.
                    </div>
                    <div class="cookie-actions">
                        <button class="btn--cookie btn--cookie-secondary" id="cookie-settings-btn">Nastavení</button>
                        <button class="btn--cookie btn--cookie-secondary" id="cookie-reject-btn">Jen nezbytné</button>
                        <button class="btn--cookie btn--cookie-primary" id="cookie-accept-btn">Přijmout vše</button>
                    </div>
                </div>
            </div>

            <div class="cookie-modal-overlay" id="cookie-modal">
                <div class="cookie-modal">
                    <div class="cookie-header">
                        <h3>Nastavení cookies</h3>
                        <p>Vyberte si, které cookies nám povolíte používat.</p>
                    </div>
                    
                    <div class="cookie-options">
                        <div class="cookie-option">
                            <div class="cookie-switch">
                                <label class="switch">
                                    <input type="checkbox" checked disabled>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="cookie-label">
                                <h4>Nezbytné</h4>
                                <p>Nutné pro fungování webu. Nelze je vypnout.</p>
                            </div>
                        </div>

                        <div class="cookie-option">
                            <div class="cookie-switch">
                                <label class="switch">
                                    <input type="checkbox" id="consent-analytics">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="cookie-label">
                                <h4>Analytické</h4>
                                <p>Pomáhají nám pochopit, jak web používáte (anonymně).</p>
                            </div>
                        </div>

                        <div class="cookie-option">
                            <div class="cookie-switch">
                                <label class="switch">
                                    <input type="checkbox" id="consent-marketing">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="cookie-label">
                                <h4>Marketingové</h4>
                                <p>Pro zobrazování relevantních reklam.</p>
                            </div>
                        </div>
                    </div>

                    <div class="cookie-save">
                         <button class="btn--cookie btn--cookie-secondary" id="cookie-modal-close-btn">Zavřít</button>
                        <button class="btn--cookie btn--cookie-primary" id="cookie-save-btn">Uložit výběr</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);

        // Elements
        const banner = document.getElementById('cookie-banner');
        const modal = document.getElementById('cookie-modal');

        // Show banner with delay for animation
        setTimeout(() => {
            banner.classList.add('visible');
        }, 100);

        // Event Listeners
        document.getElementById('cookie-accept-btn').addEventListener('click', () => {
            saveConsent({
                necessary: true,
                analytics: true,
                marketing: true
            });
        });

        document.getElementById('cookie-reject-btn').addEventListener('click', () => {
            saveConsent({
                necessary: true,
                analytics: false,
                marketing: false
            });
        });

        document.getElementById('cookie-settings-btn').addEventListener('click', () => {
            modal.classList.add('open');
        });

        document.getElementById('cookie-modal-close-btn').addEventListener('click', () => {
            modal.classList.remove('open');
        });

        document.getElementById('cookie-save-btn').addEventListener('click', () => {
            const analytics = document.getElementById('consent-analytics').checked;
            const marketing = document.getElementById('consent-marketing').checked;

            saveConsent({
                necessary: true,
                analytics: analytics,
                marketing: marketing
            });

            modal.classList.remove('open');
        });

        function saveConsent(settings) {
            localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
                ...settings,
                timestamp: new Date().toISOString()
            }));

            banner.classList.remove('visible');

            // Remove from DOM after transition
            setTimeout(() => {
                banner.remove();
                modal.remove();
            }, 500);

            // Here you would normally initialize scripts based on consent
            // e.g. if (settings.analytics) initGA();
        }
    }
});
