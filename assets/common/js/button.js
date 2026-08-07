(() => {
    "use strict";
    const done = new WeakSet(),
        fonts = new Set();
    const init = (node) => {
        if (done.has(node)) return;
        done.add(node);
        const value = String(
            node.dataset.buttonFont ||
                node.closest("[data-button-font]")?.dataset.buttonFont ||
                "",
        ).trim();
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
        node.style.fontFamily = family;
    };
    const scan = (s = document) => {
        const nodes = [];
        if (s.matches?.(".g-button")) nodes.push(s);
        s.querySelectorAll?.(".g-button").forEach((n) => nodes.push(n));
        nodes.forEach(init);
    };
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
