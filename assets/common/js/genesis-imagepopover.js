(() => {
  "use strict";

  const initialized = new WeakSet();

  const init = (root) => {
    if (initialized.has(root)) return;
    initialized.add(root);

    const wraps = [...root.querySelectorAll(".g-popover-marker-wrap")];
    const closeAll = (except = null) => wraps.forEach((wrap) => {
      if (wrap === except) return;
      wrap.querySelector(".g-popover-card").hidden = true;
      wrap.querySelector(".g-popover-marker").setAttribute("aria-expanded", "false");
    });
    const toggle = (wrap, open) => {
      closeAll(open ? wrap : null);
      wrap.querySelector(".g-popover-card").hidden = !open;
      wrap.querySelector(".g-popover-marker").setAttribute("aria-expanded", String(open));
    };

    wraps.forEach((wrap) => {
      const marker = wrap.querySelector(".g-popover-marker");
      const card = wrap.querySelector(".g-popover-card");
      marker.addEventListener("click", () => toggle(wrap, card.hidden));
      wrap.querySelector(".g-popover-close")?.addEventListener("click", () => toggle(wrap, false));
      if (root.dataset.mode === "hover") {
        wrap.addEventListener("mouseenter", () => toggle(wrap, true));
        wrap.addEventListener("mouseleave", () => toggle(wrap, false));
      }
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) closeAll();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });
  };

  const scan = (scope = document) => (scope.matches?.("[data-image-popover]") ? [scope] : scope.querySelectorAll?.("[data-image-popover]") || []).forEach(init);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true }) : scan();
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)))).observe(document.documentElement, { childList: true, subtree: true });
})();
