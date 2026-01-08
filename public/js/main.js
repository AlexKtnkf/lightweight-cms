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

// Navbar scroll behavior (transparent to white)
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    function updateNavbar() {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 100) {
        navbar.classList.add('transparent');
      } else {
        navbar.classList.remove('transparent');
      }
    }
    
    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Initial state
  }
});
