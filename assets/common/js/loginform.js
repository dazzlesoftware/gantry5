(() => {
    "use strict";
    const done = new WeakSet(),
        loaded = new Set();
    const loadFont = (value) => {
        let family = value;
        if (value.startsWith("family=")) {
            const params = new URLSearchParams(value);
            family = (params.get("family") || "")
                .replace(/\+/g, " ")
                .split(":")[0];
            const href = `https://fonts.googleapis.com/css?${value}`;
            if (family && !loaded.has(href)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = href;
                document.head.append(link);
                loaded.add(href);
            }
        }
        return family;
    };
    const apply = (node, dataKey) => {
        if (done.has(node)) return;
        done.add(node);
        const value = String(node.closest(`[${dataKey}]`)?.getAttribute(dataKey) || "").trim();
        if (!value) return;
        node.style.fontFamily = loadFont(value);
    };
    const targets = [
        [".g-loginform-title", "data-loginform-title-font"],
        [".g-loginform-label", "data-loginform-label-font"],
        [".g-loginform-link", "data-loginform-link-font"],
    ];
    const scan = (scope = document) => {
        targets.forEach(([selector, dataKey]) => {
            const nodes = [];
            if (scope.matches?.(selector)) nodes.push(scope);
            scope.querySelectorAll?.(selector).forEach((node) => nodes.push(node));
            nodes.forEach((node) => apply(node, dataKey));
        });
    };
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true })
        : scan();
    new MutationObserver((records) =>
        records.forEach((record) =>
            record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node)),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
