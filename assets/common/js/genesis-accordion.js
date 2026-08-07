(() => {
    "use strict";
    const done = new WeakSet(),
        fonts = new Set();
    const font = (root) => {
        const value = String(root.dataset.titleFont || "").trim();
        if (!value) return;
        let family = value;
        if (value.startsWith("family=")) {
            const p = new URLSearchParams(value);
            family = (p.get("family") || "").replace(/\+/g, " ").split(":")[0];
            const href = `https://fonts.googleapis.com/css?${value}`;
            if (family && !fonts.has(href)) {
                const l = document.createElement("link");
                l.rel = "stylesheet";
                l.href = href;
                document.head.append(l);
                fonts.add(href);
            }
        }
        root.querySelectorAll(".g-accordion-header").forEach(
            (n) => (n.style.fontFamily = family),
        );
    };
    const init = (root) => {
        if (done.has(root)) return;
        done.add(root);
        font(root);
        root.querySelectorAll("[data-accordion-toggle]").forEach((button) =>
            button.addEventListener("click", () => {
                const item = button.closest(".g-accordion-item"),
                    open = !item.classList.contains("is-open");
                if (root.dataset.multi !== "enable")
                    root.querySelectorAll(".g-accordion-item.is-open").forEach(
                        (other) => {
                            if (other !== item) {
                                other.classList.remove("is-open");
                                other
                                    .querySelector("[data-accordion-toggle]")
                                    .setAttribute("aria-expanded", "false");
                                other.querySelector(
                                    ".g-accordion-panel",
                                ).hidden = true;
                            }
                        },
                    );
                item.classList.toggle("is-open", open);
                button.setAttribute("aria-expanded", String(open));
                item.querySelector(".g-accordion-panel").hidden = !open;
            }),
        );
    };
    const scan = (s = document) =>
        (s.matches?.("[data-accordion]")
            ? [s]
            : s.querySelectorAll?.("[data-accordion]") || []
        ).forEach(init);
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
