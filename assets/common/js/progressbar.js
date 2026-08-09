(() => {
    "use strict";

    const initialized = new WeakSet();
    const fontsLoaded = new Set();

    const loadFont = (value) => {
        let family = value;
        if (value.startsWith("family=")) {
            const params = new URLSearchParams(value);
            family = (params.get("family") || "").replace(/\+/g, " ").split(":")[0];
            const href = `https://fonts.googleapis.com/css?${value}`;
            if (family && !fontsLoaded.has(href)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = href;
                document.head.append(link);
                fontsLoaded.add(href);
            }
        }
        return family;
    };

    const applyLabelFont = (root) => {
        const value = String(root.dataset.progressbarLabelFont || "").trim();
        if (!value) return;
        const family = loadFont(value);
        root.querySelectorAll(".g-progressbar-label").forEach((label) => {
            label.style.fontFamily = family;
        });
    };

    const showBar = (bar, duration) => {
        const target = Math.max(0, Math.min(100, Number(bar.dataset.progressbarTarget) || 0));
        requestAnimationFrame(() => {
            bar.style.transitionDuration = `${duration}ms`;
            bar.style.width = `${target}%`;
        });
    };

    const init = (root) => {
        if (initialized.has(root)) return;
        initialized.add(root);

        applyLabelFont(root);

        const bars = root.querySelectorAll(".g-progressbar-bar");
        if (!bars.length) return;
        const duration = Math.max(0, Number(root.dataset.duration) || 0);

        const show = () => bars.forEach((bar) => showBar(bar, duration));

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

    const scan = (scope = document) =>
        (scope.matches?.("[data-progressbar]") ? [scope] : scope.querySelectorAll?.("[data-progressbar]") || []).forEach(init);

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => scan(), { once: true })
        : scan();

    new MutationObserver((records) =>
        records.forEach((record) => record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node))),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
