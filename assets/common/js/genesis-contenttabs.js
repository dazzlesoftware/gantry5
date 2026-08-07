(() => {
  "use strict";

  const initialized = new WeakSet();

  const init = (root) => {
    if (initialized.has(root)) return;
    initialized.add(root);

    const tabs = [...root.querySelectorAll("[data-tab-index]")];
    const panels = [...root.querySelectorAll(".g-content-tab-panel")];

    const activate = (index, focus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel, panelIndex) => {
        const active = panelIndex === index;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
      });

      if (focus) tabs[index]?.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + direction + tabs.length) % tabs.length;
        activate(next, true);
      });
    });

    activate(0);
  };

  const scan = (scope = document) => {
    const roots = scope.matches?.("[data-content-tabs]") ? [scope] : scope.querySelectorAll?.("[data-content-tabs]") || [];
    roots.forEach(init);
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true }) : scan();
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)))).observe(document.documentElement, { childList: true, subtree: true });
})();
