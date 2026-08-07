(() => {
    "use strict";
    const instances = new WeakSet(),
        loadedFonts = new Set();
    const videoUrl = (value) => {
        try {
            const url = new URL(value, location.href);
            if (url.hostname.includes("youtube.com")) {
                const id = url.searchParams.get("v");
                if (id)
                    return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1`;
            }
            if (url.hostname === "youtu.be")
                return `https://www.youtube.com/embed/${encodeURIComponent(url.pathname.slice(1))}?autoplay=1`;
            if (url.hostname.includes("vimeo.com")) {
                const id = url.pathname.split("/").filter(Boolean).pop();
                if (id)
                    return `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1`;
            }
            url.searchParams.set("autoplay", "1");
            return url.href;
        } catch {
            return value;
        }
    };
    const applyFont = (root) => {
        const font = String(root.dataset.buttonFont || "").trim();
        if (!font) return;
        let family = font;
        if (font.startsWith("family=")) {
            const params = new URLSearchParams(font);
            family = (params.get("family") || "")
                .replace(/\+/g, " ")
                .split(":")[0];
            const href = `https://fonts.googleapis.com/css?${font}`;
            if (family && !loadedFonts.has(href)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = href;
                document.head.append(link);
                loadedFonts.add(href);
            }
        }
        const button = root.querySelector(".g-modal-button");
        if (button && family)
            button.style.fontFamily = `'${family.replace(/'/g, "\\'")}'`;
    };
    const initRoot = (root) => {
        if (instances.has(root)) return;
        instances.add(root);
        applyFont(root);
        const dialog = root.querySelector(".g-modal-dialog"),
            open = root.querySelector("[data-modal-open]"),
            close = root.querySelector("[data-modal-close]"),
            frame = root.querySelector("[data-modal-video]");
        if (!dialog || !open) return;
        let returnFocus = null;
        const shut = () => {
            if (dialog.open) dialog.close();
            if (frame) frame.removeAttribute("src");
            document.body.classList.remove("g-modal-open");
            returnFocus?.focus?.();
        };
        open.addEventListener("click", () => {
            returnFocus = document.activeElement;
            if (frame) frame.src = videoUrl(frame.dataset.src || "");
            dialog.showModal();
            document.body.classList.add("g-modal-open");
            close?.focus();
        });
        close?.addEventListener("click", shut);
        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            shut();
        });
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                const rect = dialog.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom
                )
                    shut();
            }
        });
        dialog.addEventListener("close", () => {
            if (frame) frame.removeAttribute("src");
            document.body.classList.remove("g-modal-open");
        });
    };
    const init = (scope = document) => {
        const roots = scope.matches?.("[data-modal-root]")
            ? [scope]
            : scope.querySelectorAll?.("[data-modal-root]") || [];
        roots.forEach(initRoot);
    };
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => init(), {
              once: true,
          })
        : init();
    new MutationObserver((records) =>
        records.forEach((record) =>
            record.addedNodes.forEach(
                (node) => node.nodeType === 1 && init(node),
            ),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
