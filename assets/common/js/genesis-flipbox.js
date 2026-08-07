(() => {
    "use strict";
    const scan = (s = document) =>
        (s.matches?.("[data-flipbox]")
            ? [s]
            : s.querySelectorAll?.("[data-flipbox]") || []
        ).forEach((r) => {
            if (r.dataset.bound) return;
            r.dataset.bound = "1";
            if (r.dataset.behavior === "click")
                r.addEventListener("click", (e) => {
                    if (e.target.closest("a")) return;
                    r.classList.toggle("is-flipped");
                });
            r.addEventListener("keydown", (e) => {
                if (
                    (e.key === "Enter" || e.key === " ") &&
                    !e.target.closest("a")
                ) {
                    e.preventDefault();
                    r.classList.toggle("is-flipped");
                }
            });
        });
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => scan(), {
              once: true,
          })
        : scan();
    new MutationObserver((rs) =>
        rs.forEach((r) =>
            r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n)),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
