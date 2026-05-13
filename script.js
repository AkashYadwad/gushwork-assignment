/**
 * script.js — Mangalam HDPE Pipes
 *
 * 1. Sticky Header  — slides down after hero scrolls out of view
 * 2. Hamburger Nav  — mobile menu toggle
 * 3. Hero Carousel  — left-side product image carousel with thumbnails
 * 4. Hero Zoom      — magnified preview on carousel hover
 * 5. App Carousel   — "Versatile Applications" section carousel
 * 6. App Card Zoom  — zoom overlay on each application card
 * 7. FAQ Accordion  — native <details> enhancement (already works natively)
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   1. STICKY HEADER
   Uses IntersectionObserver on the hero section.
   Adds class .show when hero is out of view.
═══════════════════════════════════════════════════════ */
(function initStickyHeader() {
  const sticky = document.getElementById('stickyHeader');
  const hero   = document.getElementById('hero');
  if (!sticky || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      sticky.classList.toggle('show', !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
  );
  observer.observe(hero);
})();


/* ═══════════════════════════════════════════════════════
   2. HAMBURGER / MOBILE NAV
═══════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      nav.setAttribute('aria-hidden', true);
    })
  );
})();


/* ═══════════════════════════════════════════════════════
   3 & 4. HERO CAROUSEL + ZOOM
   Left-side product image carousel.
   Thumbnails strip below the carousel.
   Zoom panel appears on hover and tracks cursor.
═══════════════════════════════════════════════════════ */
(function initHeroCarousel() {
  const track    = document.getElementById('heroTrack');
  const prevBtn  = document.getElementById('hcPrev');
  const nextBtn  = document.getElementById('hcNext');
  const thumbWrap= document.getElementById('hcThumbs');
  const carousel = document.getElementById('heroCarousel');
  const zoomPane = document.getElementById('hcZoom');
  const zoomInner= document.getElementById('hcZoomInner');

  if (!track) return;

  const slides  = Array.from(track.querySelectorAll('.hslide'));
  const total   = slides.length;
  let current   = 0;

  /* ── Build thumbnails ── */
  const thumbs = slides.map((_, i) => {
    const t = document.createElement('button');
    t.className = `hc-thumb hc-thumb--${i + 1}`;
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-label', `View image ${i + 1}`);
    t.addEventListener('click', () => goTo(i));
    thumbWrap.appendChild(t);
    return t;
  });

  /* ── Navigate to slide index ── */
  function goTo(index, animate = true) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transition = animate ? 'transform .45s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    track.style.transform  = `translateX(-${current * 100}%)`;

    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;

    // Sync zoom background
    if (zoomInner) {
      const slide = slides[current];
      const bg = window.getComputedStyle(slide).background;
      zoomInner.style.background = bg;
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ── Keyboard navigation ── */
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Touch drag ── */
  let startX = 0, isDrag = false;
  carousel.addEventListener('pointerdown', e => { startX = e.clientX; isDrag = true; carousel.setPointerCapture(e.pointerId); });
  carousel.addEventListener('pointerup',   e => {
    if (!isDrag) return; isDrag = false;
    const delta = e.clientX - startX;
    if (delta < -40) goTo(current + 1);
    else if (delta > 40) goTo(current - 1);
  });

  /* ── Zoom: cursor-tracking ── */
  if (carousel && zoomPane) {
    carousel.addEventListener('mousemove', e => {
      const rect = carousel.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top)  / rect.height;
      const nudgeX = (relX - 0.5) * 60;
      const nudgeY = (relY - 0.5) * 30;

      zoomPane.style.transform =
        `translate(calc(-50% + ${nudgeX}px), calc(-100% - 12px + ${nudgeY * 0.3}px)) scale(1)`;

      if (zoomInner) {
        zoomInner.style.backgroundPosition = `${relX * 100}% ${relY * 100}%`;
      }
    });

    carousel.addEventListener('mouseleave', () => {
      zoomPane.style.transform = '';
    });
  }

  goTo(0, false);
})();


/* ═══════════════════════════════════════════════════════
   5 & 6. APPLICATIONS CAROUSEL + CARD ZOOM
   Horizontal scrolling carousel with prev/next buttons.
   Each card has a zoom overlay that tracks the cursor.
═══════════════════════════════════════════════════════ */
(function initAppCarousel() {
  const track    = document.getElementById('appTrack');
  const prevBtn  = document.getElementById('appPrev');
  const nextBtn  = document.getElementById('appNext');
  const carousel = document.getElementById('appCarousel');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.acard'));
  let current = 0;

  /* ── Card width including gap ── */
  function stepWidth() {
    if (!cards[0]) return 0;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
    return cards[0].getBoundingClientRect().width + gap;
  }

  /* ── Go to index ── */
  function goTo(index, animate = true) {
    current = Math.max(0, Math.min(index, cards.length - 1));
    track.style.transition = animate ? 'transform .48s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    track.style.transform  = `translateX(-${current * stepWidth()}px)`;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === cards.length - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ── Keyboard ── */
  if (carousel) {
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });
  }

  /* ── Touch drag ── */
  let startX = 0, startOffset = 0, isDrag = false;
  if (carousel) {
    carousel.addEventListener('pointerdown', e => {
      startX = e.clientX;
      startOffset = current * stepWidth();
      isDrag = true;
      track.style.transition = 'none';
      carousel.setPointerCapture(e.pointerId);
    });
    carousel.addEventListener('pointermove', e => {
      if (!isDrag) return;
      track.style.transform = `translateX(${-(startOffset - (e.clientX - startX))}px)`;
    });
    const endDrag = e => {
      if (!isDrag) return; isDrag = false;
      const delta = e.clientX - startX;
      if (delta < -40) goTo(current + 1);
      else if (delta > 40) goTo(current - 1);
      else goTo(current);
    };
    carousel.addEventListener('pointerup',     endDrag);
    carousel.addEventListener('pointercancel', endDrag);
  }

  /* ── Recalc on resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current, false), 150);
  });

  goTo(0, false);

  /* ── Card zoom (cursor tracking) ── */
  cards.forEach(card => {
    const imgWrap  = card.querySelector('.acard__img-wrap');
    const zoomPane = card.querySelector('.acard__zoom');
    const zoomInner= card.querySelector('.acard__zoom-inner');
    if (!imgWrap || !zoomPane) return;

    imgWrap.addEventListener('mousemove', e => {
      const rect = imgWrap.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top)  / rect.height;
      const nudgeX = (relX - 0.5) * 70;
      const nudgeY = (relY - 0.5) * 35;

      zoomPane.style.transform =
        `translate(calc(-50% + ${nudgeX}px), calc(-100% - 14px + ${nudgeY * 0.3}px)) scale(1)`;

      if (zoomInner) {
        zoomInner.style.backgroundPosition = `${relX * 100}% ${relY * 100}%`;
      }
    });

    imgWrap.addEventListener('mouseleave', () => {
      zoomPane.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   7. SCROLL REVEAL
   Lightweight entrance animation for key elements.
   Uses IntersectionObserver — no external library.
═══════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity .55s cubic-bezier(.25,.46,.45,.94),
                  transform .55s cubic-bezier(.25,.46,.45,.94);
    }
    .reveal.visible {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.pcard, .acard, .faq-item, .contact__form-card, .expert-banner, .catalogue-cta'
  );

  // Stagger siblings
  const groups = new Map();
  targets.forEach(el => {
    el.classList.add('reveal');
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach(siblings =>
    siblings.forEach((el, i) => { el.style.transitionDelay = `${i * 70}ms`; })
  );

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  targets.forEach(el => io.observe(el));
})();
