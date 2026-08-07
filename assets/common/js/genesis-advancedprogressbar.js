(() => {
  "use strict";

  const initialized = new WeakSet();

  const init = (root) => {
    if (initialized.has(root)) return;
    initialized.add(root);

    const bar = root.querySelector(".progress-bar");
    if (!bar) return;
    const target = Math.max(0, Math.min(100, Number(root.dataset.progress) || 0));
    const duration = Math.max(0, Number(root.dataset.duration) || 0);

    const show = () => {
      requestAnimationFrame(() => {
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.width = `${target}%`;
      });
    };

    if (root.dataset.animate === "enable" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        show();
        observer.disconnect();
      }, { threshold: 0.2 });
      observer.observe(root);
    } else {
      show();
    }
  };

  const scan = (scope = document) => (scope.matches?.("[data-advanced-progress]") ? [scope] : scope.querySelectorAll?.("[data-advanced-progress]") || []).forEach(init);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true }) : scan();
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)))).observe(document.documentElement, { childList: true, subtree: true });
})();
