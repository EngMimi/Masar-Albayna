/* =========================================================
   مسار البينة — main.js
   Vanilla JS: nav, loader, reveal, counters, slider, accordion,
   articles filter, contact form.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initPageLoader();
  initHeader();
  initMobileNav();
  initActiveNavLink();
  initReveal();
  initCounters();
  initTestimonialSlider();
  initFaqAccordion();
  initBackToTop();
  initArticlesFilter();
  initContactForm();
  initAreaPreselect();
  initContactPopup();
  initHeroHeadlineRotator();
  initPracticeCarousel();
  initFooterYear();
});

/* ---------- Page loader ---------- */
function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;
  document.body.classList.add("is-loading");

  const hide = () => {
    loader.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
  };

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    hide();
    return;
  }
  window.setTimeout(hide, 700);
}

/* ---------- Sticky / glass header ---------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-nav");
  if (!toggle || !menu) return;

  const iconMenu = toggle.querySelector(".icon-menu");
  const iconClose = toggle.querySelector(".icon-close");

  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    iconMenu?.classList.remove("is-hidden");
    iconClose?.classList.add("is-hidden");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    iconMenu?.classList.toggle("is-hidden", isOpen);
    iconClose?.classList.toggle("is-hidden", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
}

/* ---------- Highlight active nav link based on current page ---------- */
function initActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-text, .reveal-image"
  );
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
          settleRevealMask(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* once a .reveal-text/.reveal-image wipe finishes, its .reveal-mask no longer
   needs clip-path/transform — dropping them frees it from staying an active
   compositing layer for the rest of the page's life (e.g. behind an
   indefinitely-animating rotator), which is what caused stray repaint
   artifacts after several minutes on-page. */
function settleRevealMask(target) {
  const mask = target.querySelector(".reveal-mask");
  if (!mask) return;

  const settle = () => {
    mask.style.clipPath = "none";
    mask.style.transform = "none";
  };

  mask.addEventListener("transitionend", settle, { once: true });
  window.setTimeout(settle, 1000);
}

/* ---------- Count-up statistics ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- Testimonials slider ---------- */
function initTestimonialSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const track = slider.querySelector(".slider__track");
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = slider.querySelector("[data-slider-prev]");
  const nextBtn = slider.querySelector("[data-slider-next]");
  const dotsWrap = slider.querySelector(".slider__dots");
  if (!track || !slides.length) return;

  let index = 0;
  let autoplayId = null;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `الشهادة ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap?.appendChild(dot);
    return dot;
  });

  function update() {
    const offset = index * 100;
    track.style.transform = `translateX(${document.dir === "rtl" ? offset : -offset}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    restartAutoplay();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function restartAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = window.setInterval(next, 6000);
  }

  nextBtn?.addEventListener("click", next);
  prevBtn?.addEventListener("click", prev);

  update();
  restartAutoplay();
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector(".faq-item__question");
    const answer = item.querySelector(".faq-item__answer");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        other.classList.remove("is-open");
        const otherAnswer = other.querySelector(".faq-item__answer");
        if (otherAnswer) otherAnswer.style.maxHeight = "0px";
        other.querySelector(".faq-item__question")?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle("is-visible", window.scrollY > 480);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Articles: search + category filter ---------- */
function initArticlesFilter() {
  const grid = document.querySelector("[data-articles-grid]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".article-card"));
  const searchInput = document.querySelector("[data-articles-search]");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const noResults = document.querySelector(".no-results");
  let activeCategory = "all";

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const title = card.dataset.title || "";
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesQuery = !query || title.includes(query);
      const show = matchesCategory && matchesQuery;
      card.parentElement.style.display = show ? "" : "none";
      if (show) visibleCount += 1;
    });

    noResults?.classList.toggle("is-visible", visibleCount === 0);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeCategory = chip.dataset.category || "all";
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);
}

/* ---------- Contact form (client-side validation, no backend) ---------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const successBox = document.querySelector(".form-success");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll(".field[data-required]").forEach((field) => {
      const input = field.querySelector("input, select, textarea");
      if (!input) return;
      const value = input.value.trim();
      const isEmail = input.type === "email";
      const emailOk = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!value || !emailOk) {
        field.classList.add("has-error");
        valid = false;
      } else {
        field.classList.remove("has-error");
      }
    });

    if (!valid) return;

    successBox?.classList.add("is-visible");
    form.reset();
    successBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  form.querySelectorAll(".field input, .field select, .field textarea").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".field")?.classList.remove("has-error");
    });
  });
}

/* ---------- Preselect practice area from ?area= query param ---------- */
function initAreaPreselect() {
  const select = document.querySelector("[data-area-select]");
  if (!select) return;
  const params = new URLSearchParams(window.location.search);
  const area = params.get("area");
  if (!area) return;
  const optionExists = Array.from(select.options).some((opt) => opt.value === area);
  if (optionExists) select.value = area;
}

/* ---------- Quick contact popup (WhatsApp / Email — no forms, no booking) ---------- */
function initContactPopup() {
  const popup = document.querySelector("[data-contact-popup]");
  const openers = document.querySelectorAll("[data-open-contact-popup]");
  if (!popup || !openers.length) return;

  const closers = popup.querySelectorAll("[data-contact-popup-close]");
  let lastFocused = null;

  function open(e) {
    e.preventDefault();
    lastFocused = document.activeElement;
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("popup-open");
    document.addEventListener("keydown", onKeydown);
    popup.querySelector(".contact-popup__close")?.focus();
  }

  function close() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("popup-open");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  openers.forEach((btn) => btn.addEventListener("click", open));
  closers.forEach((el) => el.addEventListener("click", close));
}

/* ---------- Hero headline: single-span word rotator ---------- */
function initHeroHeadlineRotator() {
  const el = document.querySelector(".hero-headline__rotator");
  if (!el) return;

  const words = (el.dataset.words || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
  if (words.length < 2) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FADE_MS = 350;
  const HOLD_MS = 2600;
  let index = 0;

  window.setInterval(() => {
    index = (index + 1) % words.length;
    el.classList.add("is-leaving");
    window.setTimeout(() => {
      el.textContent = words[index];
      el.classList.remove("is-leaving");
      el.classList.add("is-entering");
      requestAnimationFrame(() => {
        el.classList.remove("is-entering");
      });
    }, FADE_MS);
  }, HOLD_MS);
}

/* ---------- Practice areas: depth carousel ---------- */
function initPracticeCarousel() {
  const root = document.querySelector("[data-practice-carousel]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".carousel__card"));
  const total = cards.length;
  if (!total) return;

  const dotsWrap = document.querySelector("[data-carousel-dots]");
  let active = 0;
  let autoplayId = null;

  const dots = cards.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", `مجال ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap?.appendChild(dot);
    return dot;
  });

  function styleFor(diff) {
    const sign = Math.sign(diff);
    const abs = Math.min(Math.abs(diff), 2);
    if (abs === 0) return { x: 0, scale: 1.1, rotY: 0, opacity: 1, z: 3, blur: 0 };
    if (abs === 1) return { x: sign * 62, scale: 0.9, rotY: sign * 12, opacity: 0.65, z: 2, blur: 1.5 };
    return { x: sign * 130, scale: 0.78, rotY: sign * 18, opacity: 0, z: 1, blur: 2 };
  }

  function render() {
    cards.forEach((card, i) => {
      let diff = i - active;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;

      const s = styleFor(diff);
      // -50% is a physical (direction-agnostic) centering offset: with `left: 50%` in CSS,
      // this always centers the card regardless of dir="rtl"/"ltr". Do not use margin-inline-*
      // here — it resolves to margin-right in RTL, which is inert against a physical `left`.
      card.style.transform = `translateX(${s.x - 50}%) scale(${s.scale}) rotateY(${s.rotY}deg)`;
      card.style.opacity = String(s.opacity);
      card.style.zIndex = String(s.z);
      card.style.filter = s.blur ? `blur(${s.blur}px)` : "none";
      card.style.pointerEvents = Math.abs(diff) <= 1 ? "auto" : "none";
      card.classList.toggle("is-center", diff === 0);
      card.classList.toggle("carousel__card--left", diff < 0);
      card.classList.toggle("carousel__card--right", diff > 0);
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
  }

  function goTo(i) {
    active = ((i % total) + total) % total;
    render();
    restartAutoplay();
  }

  function next() {
    goTo(active + 1);
  }

  function restartAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = window.setInterval(next, 4000);
  }

  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (i !== active) {
        e.preventDefault();
        goTo(i);
      }
    });
  });

  root.addEventListener("mouseenter", () => autoplayId && clearInterval(autoplayId));
  root.addEventListener("mouseleave", restartAutoplay);

  render();
  restartAutoplay();
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
