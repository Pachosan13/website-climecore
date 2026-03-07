/* ═══════════════════════════════════════════════════════════
   CLIMECORE — Main JavaScript
   Scroll reveals, carousels, counters, nav, parallax
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOADER ──
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 1800);
  }

  // ── NAV SCROLL ──
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // ── MOBILE MENU ──
  const toggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── SCROLL REVEAL (Intersection Observer) ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // ── COUNTER ANIMATION ──
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.floor(eased * (target - start) + start);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  // ── CAROUSEL ──
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    let current = 0;
    const total = slides.length;

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Auto advance
    let autoplay = setInterval(() => goTo(current + 1), 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo(current + 1), 5000);
    });
  });

  // ── PARALLAX on scroll ──
  const parallaxBands = document.querySelectorAll('.parallax-band img');
  window.addEventListener('scroll', () => {
    parallaxBands.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const speed = 0.3;
      const yPos = rect.top * speed;
      img.style.transform = `translateY(${yPos}px)`;
    });
  });

  // ── SMOOTH SCROLL for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── ACTIVE NAV LINK ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ═══════════════════════════════════════════════════════════
  // VRV EXPLOSIVE PRODUCT REVEAL — GSAP ScrollTrigger Animation
  // Apple-style pinned scroll with crossfade + labels + scan
  // ═══════════════════════════════════════════════════════════
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const vrvSection = document.querySelector('.vrv-section');
    if (vrvSection) {

      // Main pinned timeline
      const vrvTL = gsap.timeline({
        scrollTrigger: {
          trigger: '.vrv-section',
          start: 'top top',
          end: '+=250%',
          pin: '.vrv-pin',
          scrub: 1.2,
          anticipatePin: 1,
        }
      });

      // Phase 1: Flash + Scanline sweep (0 → 0.25)
      vrvTL
        .to('.vrv-scanline', {
          top: '100%',
          opacity: 1,
          duration: 1.2,
          ease: 'none'
        }, 0)
        .to('.vrv-flash', {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.in'
        }, 0.5)
        .to('.vrv-flash', {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.9)

      // Phase 2: Assembled → Exploded crossfade (0.5 → 1.5)
        .to('.vrv-img-assembled', {
          opacity: 0,
          scale: 1.08,
          filter: 'blur(6px)',
          duration: 1,
          ease: 'power2.inOut'
        }, 0.6)
        .to('.vrv-img-exploded', {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.inOut'
        }, 0.7)

      // Phase 3: Glow ring intensifies
        .to('.vrv-glow-ring', {
          opacity: 1,
          scale: 1.15,
          duration: 1,
          ease: 'power2.out'
        }, 0.8)

      // Phase 4: Specs animate in (1.5 → 2.0)
        .to('.vrv-specs-grid', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        }, 1.5)

      // Phase 5: Labels fly in with stagger (2.0 → 2.8)
        .to('.vrv-lbl', {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.5,
          ease: 'back.out(1.4)'
        }, 2.0)

      // Phase 6: Features list slides in (2.5 → 3.2)
        .to('.vrv-feat-list', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        }, 2.5)

      // Phase 7: Hold for reading (3.2 → 4.0)
        .to({}, { duration: 1 });

      // Hide scroll cue when animation starts
      ScrollTrigger.create({
        trigger: '.vrv-section',
        start: 'top top',
        onEnter: () => gsap.to('.vrv-scroll-cue', { opacity: 0, duration: 0.4 }),
        onLeaveBack: () => gsap.to('.vrv-scroll-cue', { opacity: 1, duration: 0.4 })
      });

      // Reset scanline after it completes
      ScrollTrigger.create({
        trigger: '.vrv-section',
        start: 'top+=80% top',
        onEnter: () => gsap.set('.vrv-scanline', { opacity: 0 }),
      });
    }
  }

});
