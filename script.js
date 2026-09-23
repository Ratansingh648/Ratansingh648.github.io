/**
 * Ratan Madan Singh — Personal Portfolio
 * Lightweight vanilla JS, zero dependencies — optimized for performance
 */

(function() {
  'use strict';

  // ==========================================================================
  // Theme Management (localStorage, no cookies)
  // ==========================================================================
  const THEME_KEY = 'portfolio-theme';
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize theme
  applyTheme(getInitialTheme());

  // Listen for system theme changes (only if user hasn't set preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // ==========================================================================
  // Mobile Navigation
  // ==========================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

  function toggleMobileNav() {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isOpen);
    navMenu.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', toggleMobileNav);
    navLinks.forEach(link => link.addEventListener('click', closeMobileNav));
  }

  // ==========================================================================
  // Scroll Spy - Active Nav Link (throttled to 100ms)
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-menu a[href^="#"]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${id}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }

  // Throttle scroll spy to max 10fps (100ms) — much lighter than rAF on every scroll
  let scrollSpyTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollSpyTimer) return;
    scrollSpyTimer = setTimeout(() => {
      updateActiveNav();
      scrollSpyTimer = null;
    }, 100);
  }, { passive: true });

  // Initial check
  updateActiveNav();

  // ==========================================================================
  // Contact Form (Formspree)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
        showFormStatus('Please fill in all fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
      }

      submitBtn.disabled = true;
      showFormStatus('Sending...', 'pending');

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        if (response.ok) {
          showFormStatus('Thanks! Your message has been sent.', 'success');
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        console.error('Form error:', err);
        showFormStatus('Something went wrong. Please try emailing directly.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
  }

  // ==========================================================================
  // Native Lazy-Loading Fallback (SINGLE IntersectionObserver)
  // ==========================================================================
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -5% 0px',
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.tagName === 'IMG' && entry.target.loading === 'lazy') {
        entry.target.loading = 'eager';  // Switch to eager once in viewport
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe lazy images only
  document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));

  // ==========================================================================
  // Dynamic Year in Footer
  // ==========================================================================
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // Smooth Scroll Fallback for Anchor Links
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        history.pushState(null, '', targetId);
      }
    });
  });

})();