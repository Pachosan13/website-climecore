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
  // VRV SHARD EXPLOSION — Machine shatters into spinning pieces
  // Scroll down = EXPLODE | Scroll up = REASSEMBLE
  // ═══════════════════════════════════════════════════════════
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const vrvSection = document.querySelector('.vrv-section');
    if (vrvSection) {

      const assembledImg = document.querySelector('.vrv-img-assembled');
      const product = document.querySelector('.vrv-product');

      function initShardExplosion() {
        const COLS = 4, ROWS = 4;

        // Match object-fit: contain dimensions
        const cW = product.offsetWidth;
        const cH = product.offsetHeight;
        const imgA = assembledImg.naturalWidth / assembledImg.naturalHeight;
        const cA = cW / cH;
        var dW, dH, oX, oY;
        if (imgA > cA) { dW = cW; dH = cW / imgA; oX = 0; oY = (cH - dH) / 2; }
        else { dH = cH; dW = cH * imgA; oX = (cW - dW) / 2; oY = 0; }

        // ── Shards container ──
        var shardsWrap = document.createElement('div');
        shardsWrap.className = 'vrv-shards';
        shardsWrap.style.cssText = 'position:absolute;left:' + oX + 'px;top:' + oY + 'px;width:' + dW + 'px;height:' + dH + 'px;z-index:2;pointer-events:none;';

        var shardW = dW / COLS, shardH = dH / ROWS;
        var shards = [], cenX = dW / 2, cenY = dH / 2;

        // Seeded PRNG for consistent explosion
        var seed = 42;
        function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

        // Create 4×4 = 16 shard pieces
        for (var r = 0; r < ROWS; r++) {
          for (var c = 0; c < COLS; c++) {
            var sh = document.createElement('div');
            sh.className = 'vrv-shard';
            sh.style.cssText = 'position:absolute;left:' + (c * shardW) + 'px;top:' + (r * shardH) + 'px;width:' + shardW + 'px;height:' + shardH + 'px;background-image:url(' + assembledImg.src + ');background-size:' + dW + 'px ' + dH + 'px;background-position:-' + (c * shardW) + 'px -' + (r * shardH) + 'px;background-repeat:no-repeat;';
            shardsWrap.appendChild(sh);

            // Explosion vector — outward from center + random scatter
            var dx = (c * shardW + shardW / 2) - cenX;
            var dy = (r * shardH + shardH / 2) - cenY;
            var ang = Math.atan2(dy, dx);
            var dist = Math.sqrt(dx * dx + dy * dy);
            var sprd = 2.0 + rnd() * 1.5;

            shards.push({
              el: sh,
              tx: Math.cos(ang) * dist * sprd + (rnd() - 0.5) * 60,
              ty: Math.sin(ang) * dist * sprd + (rnd() - 0.5) * 60,
              rot: (rnd() - 0.5) * 720,
              d: dist
            });
          }
        }

        product.appendChild(shardsWrap);
        assembledImg.style.visibility = 'hidden';

        // ── Spark particles ──
        for (var i = 0; i < 18; i++) {
          var sp = document.createElement('div');
          sp.className = 'vrv-spark';
          var sz = 3 + rnd() * 5;
          sp.style.cssText = 'position:absolute;left:50%;top:50%;width:' + sz + 'px;height:' + sz + 'px;background:var(--ice);border-radius:50%;opacity:0;z-index:7;pointer-events:none;box-shadow:0 0 10px rgba(0,194,255,0.9);';
          shardsWrap.appendChild(sp);
          var sa = (i / 18) * Math.PI * 2 + rnd() * 0.5;
          var sd = 120 + rnd() * 280;
          shards.push({
            el: sp,
            tx: Math.cos(sa) * sd,
            ty: Math.sin(sa) * sd,
            rot: 0,
            d: -1,
            isSpark: true
          });
        }

        // Normalize distances for stagger
        var maxD = Math.max.apply(null, shards.filter(function(s) { return s.d >= 0; }).map(function(s) { return s.d; }));

        // ══════════════════════════════════════════════════
        //  THE EXPLOSION TIMELINE
        // ══════════════════════════════════════════════════
        var vrvTL = gsap.timeline({
          scrollTrigger: {
            trigger: '.vrv-section',
            start: 'top top',
            end: '+=350%',
            pin: '.vrv-pin',
            scrub: 1,
            anticipatePin: 1,
          }
        });

        // Scanline sweep (0 → 0.4)
        vrvTL.to('.vrv-scanline', {
          top: '100%', opacity: 1, duration: 0.5, ease: 'none'
        }, 0);

        // Flash burst (0.35 → 0.55)
        vrvTL.to('.vrv-flash', { opacity: 0.9, duration: 0.1, ease: 'power2.in' }, 0.38);
        vrvTL.to('.vrv-flash', { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0.48);

        // SHARDS EXPLODE! (0.4 → 1.5)
        shards.forEach(function(s) {
          if (s.isSpark) {
            // Spark: burst out then vanish
            vrvTL.fromTo(s.el,
              { opacity: 0, x: 0, y: 0, scale: 1 },
              { opacity: 1, x: s.tx * 0.4, y: s.ty * 0.4, duration: 0.12, ease: 'power2.out' },
            0.42);
            vrvTL.to(s.el, {
              opacity: 0, x: s.tx, y: s.ty, scale: 0, duration: 0.3, ease: 'power2.in'
            }, 0.54);
          } else {
            // Shard: fly outward with rotation
            var delay = 0.42 + (s.d / maxD) * 0.18;
            vrvTL.to(s.el, {
              x: s.tx,
              y: s.ty,
              rotation: s.rot,
              scale: 0.3,
              opacity: 0,
              duration: 1.0,
              ease: 'power3.out',
            }, delay);
          }
        });

        // Exploded view fades in (0.55 → 1.2)
        vrvTL.to('.vrv-img-exploded', {
          opacity: 1, scale: 1, duration: 0.6, ease: 'power2.inOut'
        }, 0.55);

        // Glow ring intensifies (0.7 → 1.3)
        vrvTL.to('.vrv-glow-ring', {
          opacity: 1, scale: 1.15, duration: 0.6, ease: 'power2.out'
        }, 0.7);

        // Specs grid slides in (1.5 → 2.3)
        vrvTL.to('.vrv-specs-grid', {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
        }, 1.5);

        // Labels fly in with stagger (2.0 → 2.8)
        vrvTL.to('.vrv-lbl', {
          opacity: 1, y: 0, stagger: 0.15, duration: 0.5, ease: 'back.out(1.4)'
        }, 2.0);

        // Features list (2.4 → 3.2)
        vrvTL.to('.vrv-feat-list', {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
        }, 2.4);

        // Hold for reading
        vrvTL.to({}, { duration: 0.8 });

        // Scroll cue
        ScrollTrigger.create({
          trigger: '.vrv-section',
          start: 'top top',
          onEnter: function() { gsap.to('.vrv-scroll-cue', { opacity: 0, duration: 0.4 }); },
          onLeaveBack: function() { gsap.to('.vrv-scroll-cue', { opacity: 1, duration: 0.4 }); }
        });

        ScrollTrigger.create({
          trigger: '.vrv-section',
          start: 'top+=80% top',
          onEnter: function() { gsap.set('.vrv-scanline', { opacity: 0 }); },
        });
      }

      // Fire when image ready
      if (assembledImg.complete && assembledImg.naturalWidth > 0) {
        initShardExplosion();
      } else {
        assembledImg.addEventListener('load', initShardExplosion);
      }
    }
  }

});
