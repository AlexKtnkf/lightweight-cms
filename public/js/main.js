// Lazy loading for images below 3 screen heights
// Respects prefers-reduced-motion for accessibility
document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const images = document.querySelectorAll('img[data-media-id]');
  const screenHeight = window.innerHeight;
  const threshold = screenHeight * 3;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const mediaId = img.getAttribute('data-media-id');
        
        // Load WebP version if available, fallback to original
        const webpSrc = img.getAttribute('data-webp-src');
        if (webpSrc && 'loading' in HTMLImageElement.prototype) {
          img.src = webpSrc;
        } else if (img.getAttribute('data-src')) {
          img.src = img.getAttribute('data-src');
        }
        
        // Ensure alt text is set for accessibility
        if (!img.getAttribute('alt')) {
          img.setAttribute('alt', 'Image');
        }
        
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: prefersReducedMotion ? '0px' : '50px'
  });

  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    const distanceFromTop = rect.top + window.scrollY;
    
    // Ensure alt text for accessibility
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', 'Image');
    }
    
    if (distanceFromTop > threshold) {
      // Image is below threshold, lazy load it
      img.setAttribute('loading', 'lazy');
      imageObserver.observe(img);
    } else {
      // Image is above threshold, load immediately
      const webpSrc = img.getAttribute('data-webp-src');
      if (webpSrc) {
        img.src = webpSrc;
      } else if (img.getAttribute('data-src')) {
        img.src = img.getAttribute('data-src');
      }
      img.classList.add('loaded');
    }
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Navbar scroll shadow: adds .scrolled class after 60px scroll (legacy .navbar)
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    function updateNavbar() {
      if (window.pageYOffset > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }
});

// c-nav: mobile menu toggle (matches ai_studio_code.html)
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('is-active');
      menuToggle.textContent = navMenu.classList.contains('is-active') ? 'Fermer' : 'Menu';
      menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('is-active'));
    });
    document.querySelectorAll('.c-nav__link').forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('is-active');
        menuToggle.textContent = 'Menu';
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

// Scroll reveal: animate elements with .reveal class as they enter viewport
document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Auto-tag common block elements for reveal animation
  const selectors = [
    '.c-headline', '.c-num-card', '.c-pin-grid__item', '.c-faq',
    '.c-main-feature', '.c-lead', '.c-contact', '.c-insta-card'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings: every 2nd and 3rd child get a small delay
      const mod = i % 3;
      if (mod === 1) el.classList.add('reveal-delay-1');
      if (mod === 2) el.classList.add('reveal-delay-2');
    });
  });

  // Also tag section titles
  document.querySelectorAll('.section-title').forEach(el => {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
