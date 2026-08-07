(() => {
    "use strict";

    const initialize = (root = document) => {
        const blocks = root.matches?.("[data-textblock]")
            ? [root]
            : root.querySelectorAll?.("[data-textblock]") || [];

        blocks.forEach((block) => {
            if (block.dataset.textblockReady === "true") return;
            block.dataset.textblockReady = "true";

            if (block.dataset.truncate !== "enable") return;
            const content = block.querySelector("[data-textblock-content]");
            const full = block.querySelector("[data-textblock-full]");
            const button = block.querySelector("[data-textblock-more]");
            const maximum = Number.parseInt(block.dataset.maxWords || "30", 10);
            if (
                !content ||
                !full ||
                !button ||
                !Number.isFinite(maximum) ||
                maximum < 1
            )
                return;

            const words = content.textContent
                .trim()
                .split(/\s+/u)
                .filter(Boolean);
            if (words.length <= maximum) return;

            content.textContent = words.slice(0, maximum).join(" ") + "…";
            button.hidden = false;
            button.addEventListener(
                "click",
                () => {
                    content.replaceChildren(full.content.cloneNode(true));
                    button.remove();
                    full.remove();
                },
                { once: true },
            );
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initialize(), {
            once: true,
        });
    } else {
        initialize();
    }

    new MutationObserver((mutations) =>
        mutations.forEach(({ addedNodes }) =>
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
            }),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
