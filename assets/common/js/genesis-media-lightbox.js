(() => {
    "use strict";
    const selector = "[data-genesis-lightbox]";
    let dialog, body, title, close;
    const youtube = (value) => {
        try {
            const url = new URL(value, document.baseURI),
                host = url.hostname.replace(/^www\./, "").toLowerCase();
            let id = "";
            if (host === "youtu.be")
                id = url.pathname.split("/").filter(Boolean)[0] || "";
            else if (
                [
                    "youtube.com",
                    "m.youtube.com",
                    "youtube-nocookie.com",
                ].includes(host)
            ) {
                if (url.pathname === "/watch")
                    id = url.searchParams.get("v") || "";
                else {
                    const parts = url.pathname.split("/").filter(Boolean);
                    if (["embed", "shorts", "live"].includes(parts[0]))
                        id = parts[1] || "";
                }
            }
            return id
                ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`
                : "";
        } catch {
            return "";
        }
    };
    const vimeo = (value) => {
        try {
            const url = new URL(value, document.baseURI);
            if (!/(^|\.)vimeo\.com$/i.test(url.hostname)) return "";
            const id = url.pathname
                .split("/")
                .filter(Boolean)
                .find((part) => /^\d+$/.test(part));
            return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
        } catch {
            return "";
        }
    };
    const build = () => {
        if (dialog) return;
        dialog = document.createElement("div");
        dialog.className = "g-media-lightbox";
        dialog.hidden = true;
        dialog.innerHTML =
            '<div class="g-media-lightbox-backdrop" data-lightbox-close></div><div class="g-media-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="g-media-lightbox-title"><button type="button" class="g-media-lightbox-close" data-lightbox-close aria-label="Close">&times;</button><div class="g-media-lightbox-body"></div><div class="g-media-lightbox-title" id="g-media-lightbox-title"></div></div>';
        document.body.append(dialog);
        body = dialog.querySelector(".g-media-lightbox-body");
        title = dialog.querySelector(".g-media-lightbox-title");
        close = dialog.querySelector(".g-media-lightbox-close");
        dialog.addEventListener("click", (event) => {
            if (event.target.closest("[data-lightbox-close]")) hide();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !dialog.hidden) hide();
        });
    };
    const hide = () => {
        if (!dialog) return;
        dialog.hidden = true;
        body.replaceChildren();
        document.documentElement.classList.remove("g-lightbox-open");
    };
    const show = (trigger) => {
        build();
        const href = trigger.href,
            type = trigger.dataset.genesisLightbox,
            label = trigger.dataset.lightboxTitle || "";
        let media;
        if (type === "video") {
            const embed = youtube(href) || vimeo(href);
            if (embed) {
                media = document.createElement("iframe");
                media.src = embed;
                media.allow = "autoplay; fullscreen; picture-in-picture";
                media.allowFullscreen = true;
            } else {
                media = document.createElement("video");
                media.src = href;
                media.controls = true;
                media.autoplay = true;
            }
        } else {
            media = document.createElement("img");
            media.src = href;
            media.alt = label;
        }
        body.replaceChildren(media);
        title.textContent = label;
        title.hidden = !label;
        dialog.hidden = false;
        document.documentElement.classList.add("g-lightbox-open");
        close.focus();
    };
    document.addEventListener("click", (event) => {
        const trigger = event.target.closest(selector);
        if (!trigger) return;
        event.preventDefault();
        show(trigger);
    });
})();
