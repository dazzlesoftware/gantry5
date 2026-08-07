(() => {
    "use strict";
    const done = new WeakSet(),
        fonts = new Set();
    const apply = (root, selector, value) => {
        value = String(value || "").trim();
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
        root.querySelector(selector)?.style.setProperty("font-family", family);
    };
    const init = (r) => {
        if (done.has(r)) return;
        done.add(r);
        apply(r, ".g-blocknumber-number", r.dataset.numberFont);
        apply(r, ".g-blocknumber-heading", r.dataset.headingFont);
        apply(r, ".g-blocknumber-text", r.dataset.textFont);
    };
    const scan = (s = document) =>
        (s.matches?.("[data-blocknumber]")
            ? [s]
            : s.querySelectorAll?.("[data-blocknumber]") || []
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
