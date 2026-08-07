(() => {
    "use strict";
    const done = new WeakSet(),
        T = 256;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
        project = (lat, lng, z) => {
            const n = 2 ** z,
                x = ((lng + 180) / 360) * n * T,
                y =
                    ((1 -
                        Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) /
                        2) *
                    n *
                    T;
            return { x, y };
        },
        unproject = (x, y, z) => {
            const n = 2 ** z * T;
            return {
                lng: (x / n) * 360 - 180,
                lat:
                    (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) /
                    Math.PI,
            };
        };
    const init = (root) => {
        if (done.has(root)) return;
        done.add(root);
        let lat = +root.dataset.lat || 0,
            lng = +root.dataset.lng || 0,
            z = clamp(+root.dataset.zoom || 13, 1, 19),
            drag;
        const tiles = root.querySelector(".g-osm-tiles"),
            markers = [...root.querySelectorAll(".g-osm-marker")],
            popup = root.querySelector(".g-osm-popup"),
            sources = {
                standard: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                humanitarian:
                    "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
                topographic: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
            };
        const render = () => {
            const w = root.clientWidth,
                h = root.clientHeight,
                c = project(lat, lng, z),
                minX = Math.floor((c.x - w / 2) / T),
                maxX = Math.floor((c.x + w / 2) / T),
                minY = Math.floor((c.y - h / 2) / T),
                maxY = Math.floor((c.y + h / 2) / T),
                n = 2 ** z,
                frag = document.createDocumentFragment();
            tiles.replaceChildren();
            for (let y = minY; y <= maxY; y++)
                for (let x = minX; x <= maxX; x++) {
                    if (y < 0 || y >= n) continue;
                    const img = document.createElement("img"),
                        xx = ((x % n) + n) % n;
                    img.src = (sources[root.dataset.style] || sources.standard)
                        .replace("{z}", z)
                        .replace("{x}", xx)
                        .replace("{y}", y);
                    img.alt = "";
                    img.draggable = false;
                    img.style.left = `${x * T - (c.x - w / 2)}px`;
                    img.style.top = `${y * T - (c.y - h / 2)}px`;
                    frag.append(img);
                }
            tiles.append(frag);
            markers.forEach((m) => {
                const p = project(+m.dataset.lat, +m.dataset.lng, z);
                m.style.left = `${p.x - (c.x - w / 2)}px`;
                m.style.top = `${p.y - (c.y - h / 2)}px`;
            });
        };
        root.querySelectorAll("[data-osm-zoom]").forEach(
            (b) =>
                (b.onclick = () => {
                    z = clamp(z + +b.dataset.osmZoom, 1, 19);
                    render();
                }),
        );
        markers.forEach(
            (m) =>
                (m.onclick = () => {
                    popup.querySelector("div").innerHTML =
                        m.querySelector("template").innerHTML;
                    popup.hidden = false;
                    popup.style.left = m.style.left;
                    popup.style.top = m.style.top;
                }),
        );
        popup
            .querySelector("button")
            ?.addEventListener("click", () => (popup.hidden = true));
        if (root.dataset.dragging === "enable") {
            root.addEventListener("pointerdown", (e) => {
                if (e.target.closest("button,a")) return;
                drag = { x: e.clientX, y: e.clientY, c: project(lat, lng, z) };
                root.setPointerCapture(e.pointerId);
            });
            root.addEventListener("pointermove", (e) => {
                if (!drag) return;
                const p = unproject(
                    drag.c.x - (e.clientX - drag.x),
                    drag.c.y - (e.clientY - drag.y),
                    z,
                );
                lat = p.lat;
                lng = p.lng;
                render();
            });
            root.addEventListener("pointerup", () => (drag = null));
        }
        if (root.dataset.scroll === "enable")
            root.addEventListener(
                "wheel",
                (e) => {
                    e.preventDefault();
                    z = clamp(z + (e.deltaY < 0 ? 1 : -1), 1, 19);
                    render();
                },
                { passive: false },
            );
        new ResizeObserver(render).observe(root);
        render();
    };
    const scan = (s = document) =>
        (s.matches?.("[data-osm]")
            ? [s]
            : s.querySelectorAll?.("[data-osm]") || []
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
