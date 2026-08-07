(() => {
    'use strict';
    const instances = new WeakMap(), loadedFonts = new Set();
    const applyFont = (root, selector, value) => {
        const font = String(value || '').trim(); if (!font) return; let family = font;
        if (font.startsWith('family=')) { const params = new URLSearchParams(font); family = (params.get('family') || '').replace(/\+/g, ' ').split(':')[0]; const url = `https://fonts.googleapis.com/css?${font}`; if (family && !loadedFonts.has(url)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = url; document.head.append(link); loadedFonts.add(url); } }
        if (family) root.querySelectorAll(selector).forEach(node => { node.style.fontFamily = `'${family.replace(/'/g, "\\'")}'`; });
    };
    class TeamCarousel {
        constructor(root) {
            this.root = root; this.track = root.querySelector('.g-teamcarousel-track'); this.items = [...root.querySelectorAll('.g-teamcarousel-item')]; this.index = 0; this.timer = null; this.startX = null;
            if (root.dataset.randomize === 'enable') { this.items.sort(() => Math.random() - .5).forEach(item => this.track.append(item)); }
            applyFont(root, '.g-teamcarousel-name', root.dataset.nameFont); applyFont(root, '.g-teamcarousel-designation', root.dataset.designationFont);
            root.querySelector('[data-team-prev]')?.addEventListener('click', () => this.move(-1)); root.querySelector('[data-team-next]')?.addEventListener('click', () => this.move(1));
            if (root.dataset.touch === 'enable') this.touch();
            if (root.dataset.pauseHover === 'enable') { root.addEventListener('mouseenter', () => this.stop()); root.addEventListener('mouseleave', () => this.start()); }
            window.addEventListener('resize', () => this.render(true), {passive: true}); this.render(true); this.start();
        }
        visible() { return innerWidth < 768 ? +(this.root.dataset.mobileItems || 1) : innerWidth < 1200 ? +(this.root.dataset.tabletItems || 2) : +(this.root.dataset.desktopItems || 3); }
        pages() { return Math.max(1, this.items.length - this.visible() + 1); }
        render(immediate = false) { const visible = this.visible(), pages = this.pages(); if (this.root.dataset.loop === 'enable') this.index = ((this.index % pages) + pages) % pages; else this.index = Math.max(0, Math.min(this.index, pages - 1)); this.root.style.setProperty('--gtc-visible', visible); this.track.style.transitionDuration = immediate ? '0ms' : `${Math.max(0, +(this.root.dataset.speed || 500))}ms`; this.track.style.transform = `translate3d(-${this.index * 100 / visible}%,0,0)`; this.items.forEach((item, i) => item.setAttribute('aria-hidden', String(i < this.index || i >= this.index + visible))); this.bullets(pages); }
        bullets(pages) { const holder = this.root.querySelector('[data-team-bullets]'); if (!holder) return; if (holder.children.length !== pages) holder.replaceChildren(...Array.from({length: pages}, (_, i) => { const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `Show team page ${i + 1}`); button.addEventListener('click', () => { this.index = i; this.render(); this.start(true); }); return button; })); [...holder.children].forEach((button, i) => button.classList.toggle('active', i === this.index)); }
        move(direction) { this.index += direction; this.render(); this.start(true); }
        start(reset = false) { if (reset) this.stop(); if (this.root.dataset.autoplay !== 'enable' || this.timer || this.pages() < 2) return; this.timer = setInterval(() => this.move(1), Math.max(1000, +(this.root.dataset.interval || 4500))); }
        stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
        touch() { this.root.addEventListener('pointerdown', event => { this.startX = event.clientX; this.stop(); }); this.root.addEventListener('pointerup', event => { if (this.startX !== null && Math.abs(event.clientX - this.startX) > 40) this.move(event.clientX < this.startX ? 1 : -1); this.startX = null; this.start(); }); }
    }
    const init = (scope = document) => { const roots = scope.matches?.('[data-team-carousel]') ? [scope] : scope.querySelectorAll?.('[data-team-carousel]') || []; roots.forEach(root => { if (!instances.has(root)) instances.set(root, new TeamCarousel(root)); }); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => init(), {once: true}) : init();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => node.nodeType === 1 && init(node)))).observe(document.documentElement, {childList: true, subtree: true});
})();
