(() => {
  "use strict";

  const initialized = new WeakSet();

  const init = (root) => {
    if (initialized.has(root)) return;
    initialized.add(root);

    const track = root.querySelector(".g-testimonial-carousel-track");
    const slides = [...root.querySelectorAll(".g-testimonial-carousel-item")];
    const dots = root.querySelector("[data-testimonial-dots]");
    if (!track || !slides.length) return;

    let index = 0;
    let timer;
    const visible = () => window.matchMedia("(max-width: 47.99rem)").matches ? Number(getComputedStyle(root).getPropertyValue("--gtc-mobile")) || 1 : window.matchMedia("(max-width: 74.99rem)").matches ? Number(getComputedStyle(root).getPropertyValue("--gtc-tablet")) || 1 : Number(getComputedStyle(root).getPropertyValue("--gtc-desktop")) || 1;
    const maximum = () => Math.max(0, slides.length - visible());

    const start = (reset = false) => {
      if (reset) clearInterval(timer);
      if (root.dataset.autoplay === "enable" && slides.length > visible()) timer = setInterval(() => show(index + 1), Math.max(1000, Number(root.dataset.interval) || 5000));
    };

    const show = (next, reset = false) => {
      const max = maximum();
      index = root.dataset.loop === "enable" ? (next > max ? 0 : next < 0 ? max : next) : Math.max(0, Math.min(next, max));
      track.style.transitionDuration = `${Math.max(0, Number(root.dataset.speed) || 500)}ms`;
      track.style.transform = `translate3d(calc(-${index} * (100% + var(--gtc-gap)) / var(--gtc-visible)),0,0)`;
      dots?.querySelectorAll("button").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      if (reset) start(true);
    };

    const rebuildDots = () => {
      if (!dots) return;
      dots.replaceChildren(...Array.from({ length: maximum() + 1 }, (_, dotIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `Show testimonial group ${dotIndex + 1}`);
        button.addEventListener("click", () => show(dotIndex, true));
        return button;
      }));
      show(Math.min(index, maximum()));
    };

    root.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => show(index - 1, true));
    root.querySelector("[data-testimonial-next]")?.addEventListener("click", () => show(index + 1, true));
    if (root.dataset.pauseHover === "enable") {
      root.addEventListener("mouseenter", () => clearInterval(timer));
      root.addEventListener("mouseleave", () => start(true));
    }
    window.addEventListener("resize", rebuildDots, { passive: true });
    rebuildDots();
    start();
  };

  const scan = (scope = document) => (scope.matches?.("[data-testimonial-carousel]") ? [scope] : scope.querySelectorAll?.("[data-testimonial-carousel]") || []).forEach(init);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true }) : scan();
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)))).observe(document.documentElement, { childList: true, subtree: true });
})();
