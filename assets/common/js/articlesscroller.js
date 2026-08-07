(() => {
    "use strict";
    const instances = new WeakMap();

    class ArticlesScroller {
        constructor(root) {
            this.root = root;
            this.track = root.querySelector(".g-articlesscroller-track");
            this.items = Array.from(
                root.querySelectorAll(".g-articlesscroller-item"),
            );
            this.index = 0;
            this.timer = null;
            this.startX = null;
            this.startY = null;
            this.resize = () => this.render(true);
            root.querySelector("[data-scroller-prev]")?.addEventListener(
                "click",
                () => this.move(-1),
            );
            root.querySelector("[data-scroller-next]")?.addEventListener(
                "click",
                () => this.move(1),
            );
            if (root.dataset.touch === "enable") this.bindTouch();
            root.addEventListener("mouseenter", () => this.stop());
            root.addEventListener("mouseleave", () => this.start());
            window.addEventListener("resize", this.resize, { passive: true });
            this.render(true);
            this.start();
        }
        visible() {
            if (this.root.dataset.layout === "ticker") return 1;
            return window.innerWidth < 768
                ? +(this.root.dataset.mobileItems || 1)
                : window.innerWidth < 1200
                  ? +(this.root.dataset.tabletItems || 2)
                  : +(this.root.dataset.desktopItems || 3);
        }
        pages() {
            const visible = this.visible();
            const move = Math.max(1, +(this.root.dataset.move || 1));
            return Math.max(
                1,
                Math.ceil(Math.max(0, this.items.length - visible) / move) + 1,
            );
        }
        render(immediate = false) {
            const visible = this.visible();
            const pages = this.pages();
            this.index = ((this.index % pages) + pages) % pages;
            this.root.style.setProperty("--g-articles-visible", visible);
            this.track.style.transitionDuration = immediate
                ? "0ms"
                : `${Math.max(0, +(this.root.dataset.speed || 500))}ms`;
            const stacked = this.root.dataset.layout === "scroller";
            const move = Math.max(1, +(this.root.dataset.move || 1));
            const first = Math.min(
                this.index * move,
                Math.max(0, this.items.length - visible),
            );
            if (stacked) {
                const rowHeight =
                    this.items[0]?.getBoundingClientRect().height || 0;
                this.root.querySelector(
                    ".g-articlesscroller-viewport",
                ).style.height = `${rowHeight * visible}px`;
                this.track.style.transform = `translate3d(0,-${first * rowHeight}px,0)`;
            } else {
                this.track.style.transform = `translate3d(-${(first * 100) / visible}%,0,0)`;
            }
            this.items.forEach((item, index) =>
                item.setAttribute(
                    "aria-hidden",
                    String(index < first || index >= first + visible),
                ),
            );
            this.indicators(pages);
        }
        indicators(pages) {
            const holder = this.root.querySelector(
                "[data-scroller-indicators]",
            );
            if (!holder) return;
            if (holder.children.length !== pages) {
                holder.replaceChildren(
                    ...Array.from({ length: pages }, (_, index) => {
                        const button = document.createElement("button");
                        button.type = "button";
                        button.setAttribute(
                            "aria-label",
                            `Show article page ${index + 1}`,
                        );
                        button.addEventListener("click", () => {
                            this.index = index;
                            this.render();
                            this.start(true);
                        });
                        return button;
                    }),
                );
            }
            Array.from(holder.children).forEach((button, index) =>
                button.classList.toggle("active", index === this.index),
            );
        }
        move(direction) {
            this.index += direction;
            this.render();
            this.start(true);
        }
        start(reset = false) {
            if (reset) this.stop();
            if (
                this.root.dataset.autoplay !== "enable" ||
                this.timer ||
                this.pages() < 2
            )
                return;
            this.timer = window.setInterval(
                () => this.move(1),
                Math.max(1000, +(this.root.dataset.interval || 5000)),
            );
        }
        stop() {
            if (this.timer) window.clearInterval(this.timer);
            this.timer = null;
        }
        bindTouch() {
            this.root.addEventListener("pointerdown", (event) => {
                this.startX = event.clientX;
                this.startY = event.clientY;
                this.stop();
            });
            this.root.addEventListener("pointerup", (event) => {
                const vertical = this.root.dataset.layout === "scroller";
                const distance = vertical
                    ? event.clientY - this.startY
                    : event.clientX - this.startX;
                if (
                    (vertical ? this.startY : this.startX) !== null &&
                    Math.abs(distance) > 40
                )
                    this.move(distance < 0 ? 1 : -1);
                this.startX = null;
                this.startY = null;
                this.start();
            });
        }
    }
    const initialize = (scope = document) => {
        const roots = scope.matches?.("[data-articles-scroller]")
            ? [scope]
            : scope.querySelectorAll?.("[data-articles-scroller]") || [];
        roots.forEach((root) => {
            if (!instances.has(root))
                instances.set(root, new ArticlesScroller(root));
        });
    };
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", () => initialize(), {
              once: true,
          })
        : initialize();
    new MutationObserver((mutations) =>
        mutations.forEach(({ addedNodes }) =>
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) initialize(node);
            }),
        ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
