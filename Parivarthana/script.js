const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-target]");
const parallaxItems = document.querySelectorAll("[data-speed]");
const galleryImages = document.querySelectorAll(".photo-card img");

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (dot) {
      dot.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
    }
  });

  const animateRing = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;

    if (ring) {
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    }

    requestAnimationFrame(animateRing);
  };

  animateRing();
}

galleryImages.forEach((image) => {
  image.addEventListener("error", () => {
    image.closest(".photo-card")?.classList.add("is-missing");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const formatNumber = (value, suffix) => {
  const rounded = value >= 100 ? Math.round(value) : value.toFixed(value % 1 === 0 ? 0 : 1);
  return `${rounded}${suffix || ""}`;
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = formatNumber(current, suffix);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = formatNumber(target, suffix);
        }
      };

      if (prefersReducedMotion) {
        el.textContent = formatNumber(target, suffix);
      } else {
        requestAnimationFrame(tick);
      }

      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

if (!prefersReducedMotion && parallaxItems.length > 0) {
  let ticking = false;

  const updateParallax = () => {
    const viewportHeight = window.innerHeight;

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.speed || 0);
      const distance = rect.top - viewportHeight / 2;
      const offset = distance * speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateParallax();
}
