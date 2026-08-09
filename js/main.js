// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!isOpen) {
      document.querySelectorAll('.has-dropdown.open').forEach((item) => item.classList.remove('open'));
    }
  });
}

// Mobile dropdown expand (Treatments)
document.querySelectorAll('.has-dropdown > .nav-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      btn.parentElement.classList.toggle('open');
    }
  });
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// Accordion (used on treatment pages / New Patients)
document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const panel = item.querySelector('.accordion-panel');
    const isOpen = item.classList.contains('open');

    // close siblings within the same accordion group
    const group = item.closest('.accordion');
    if (group) {
      group.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });
    }

    if (isOpen) {
      item.classList.remove('open');
      panel.style.maxHeight = null;
    } else {
      item.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// Price list tabs
document.querySelectorAll('.tab-nav').forEach((nav) => {
  const buttons = nav.querySelectorAll('.tab-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const container = nav.closest('.tabs');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });
});

// Before / After compare sliders
document.querySelectorAll('.compare-slider').forEach((el) => {
  const range = el.querySelector('.compare-range');
  if (!range) return;

  const setPos = (percent) => {
    const clamped = Math.min(100, Math.max(0, percent));
    el.style.setProperty('--pos', clamped + '%');
    range.value = clamped;
  };

  const percentFromClientX = (clientX) => {
    const rect = el.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  let dragging = false;

  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    setPos(percentFromClientX(e.clientX));
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPos(percentFromClientX(e.clientX));
  });
  el.addEventListener('pointerup', (e) => {
    dragging = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  });
  el.addEventListener('pointercancel', () => { dragging = false; });

  range.addEventListener('input', () => setPos(Number(range.value)));

  setPos(Number(range.value));
});

// Banner slideshow (Cosmetic Treatments page)
document.querySelectorAll('[data-banner-slideshow]').forEach((slideshow) => {
  const slides = Array.from(slideshow.querySelectorAll('.banner-slide'));
  const dots = Array.from(slideshow.querySelectorAll('.banner-slideshow-dot'));
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;
  const intervalMs = 3000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const startTimer = () => {
    if (reducedMotion) return;
    stopTimer();
    timer = window.setInterval(() => showSlide(index + 1), intervalMs);
  };

  const stopTimer = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      startTimer();
    });
  });

  slideshow.addEventListener('mouseenter', stopTimer);
  slideshow.addEventListener('mouseleave', startTimer);
  slideshow.addEventListener('focusin', stopTimer);
  slideshow.addEventListener('focusout', startTimer);

  startTimer();
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// Contact form (Formspree-ready — swap YOUR_FORM_ID before going live)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        status.textContent = "Thanks — we've received your message and will be in touch shortly.";
        status.style.color = '#21453e';
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      status.textContent = 'Something went wrong sending your message — please call us on 01702 553 106 instead.';
      status.style.color = '#e8735f';
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}
