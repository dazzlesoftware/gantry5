(() => {
    "use strict";
    const initialized = new WeakSet();
    const loadedFonts = new Set();
    const applyFont = (root, selector, value) => {
        const font = String(value || "").trim();
        if (!font) return;
        let family = font;
        if (font.startsWith("family=")) {
            const parameters = new URLSearchParams(font);
            family = (parameters.get("family") || "")
                .replace(/\+/g, " ")
                .split(":")[0];
            const url = `https://fonts.googleapis.com/css?${font}`;
            if (family && !loadedFonts.has(url)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = url;
                document.head.append(link);
                loadedFonts.add(url);
            }
        }
        if (family)
            root.querySelectorAll(selector).forEach((element) => {
                element.style.fontFamily = `'${family.replace(/'/g, "\\'")}'`;
            });
    };
    const init = (root) => {
        if (initialized.has(root)) return;
        initialized.add(root);
        applyFont(root, ".g-animatedheading-title", root.dataset.headingFont);
        applyFont(
            root,
            ".g-animatedheading-words, .g-animatedheading-highlight, .g-animatedheading-marquee",
            root.dataset.animatedFont,
        );
        if (
            root.dataset.mode !== "animation" ||
            root.dataset.animation === "marquee"
        )
            return;
        const words = [...root.querySelectorAll(".g-animatedheading-word")];
        const wrapper = root.querySelector(".g-animatedheading-words");
        const setWidth = (word) => {
            if (!wrapper || !word) return;
            wrapper.style.width = `${Math.ceil(word.getBoundingClientRect().width)}px`;
        };
        setWidth(words[0]);
        if (
            words.length < 2 ||
            matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;
        const animation = root.dataset.animation;
        const duration = Math.max(50, +(root.dataset.duration || 600));
        const delay = Math.max(duration, +(root.dataset.delay || 2500));
        let index = 0;
        const rotate = () => {
            const current = words[index],
                next = words[(index + 1) % words.length];
            const nextText = next.textContent;
            const measuring = next.cloneNode(true);
            measuring.className = "g-animatedheading-word is-measuring";
            wrapper.append(measuring);
            const nextWidth = Math.ceil(
                measuring.getBoundingClientRect().width,
            );
            measuring.remove();
            wrapper.style.width = `${nextWidth}px`;
            if (animation === "typing") {
                const text = nextText;
                let position = 0;
                current.classList.remove("is-visible");
                next.textContent = "";
                next.classList.add("is-visible");
                const typer = setInterval(
                    () => {
                        next.textContent = text.slice(0, ++position);
                        if (position >= text.length) clearInterval(typer);
                    },
                    Math.max(25, duration / Math.max(1, text.length)),
                );
            } else {
                current.classList.add("is-leaving");
                current.classList.remove("is-visible");
                next.classList.add("is-visible");
                setTimeout(
                    () => current.classList.remove("is-leaving"),
                    duration,
                );
            }
            index = (index + 1) % words.length;
        };
        setInterval(rotate, delay);
    };
    const scan = (scope = document) => {
        const nodes = scope.matches?.("[data-animated-heading]")
            ? [scope]
            : scope.querySelectorAll?.("[data-animated-heading]") || [];
        nodes.forEach(init);
    };
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => scan(), {
              once: true,
          })
        : scan();
    new MutationObserver((records) =>
        records.forEach((record) =>
            record.addedNodes.forEach(
                (node) => node.nodeType === 1 && scan(node),
            ),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
