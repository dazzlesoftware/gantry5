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
    // The dialog is a real Bootstrap 5 .modal now — Bootstrap's own JS (loaded
    // via genesis.load('bootstrap.5')) drives open/close/backdrop/focus-trap/
    // Escape entirely via the data-bs-toggle/data-bs-dismiss attributes in the
    // twig. All that's left here is font loading and lazily setting the video
    // iframe's src only while the modal is actually open, hooked into
    // Bootstrap's own show.bs.modal/hidden.bs.modal events.
    const initRoot = (root) => {
        if (instances.has(root)) return;
        instances.add(root);
        applyFont(root);
        const modal = root.querySelector(".modal"),
            frame = root.querySelector("[data-modal-video]");
        if (!modal) return;
        if (frame) {
            modal.addEventListener("show.bs.modal", () => {
                frame.src = videoUrl(frame.dataset.src || "");
            });
            modal.addEventListener("hidden.bs.modal", () => {
                frame.removeAttribute("src");
            });
        }
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
