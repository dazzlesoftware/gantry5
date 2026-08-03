(() => {
    'use strict';

    const selector = '[data-rel^="lightcase"]';
    const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
    const videoPattern = /\.(?:mp4|og[gv]|webm)(?:[?#].*)?$/i;
    let items = [];
    let index = 0;
    let origin = null;
    let overlay;
    let dialog;
    let content;
    let title;
    let caption;
    let sequence;
    let previous;
    let next;

    const button = (className, label, action) => {
        const element = document.createElement('a');
        element.href = '#';
        element.className = className;
        element.setAttribute('aria-label', label);
        element.addEventListener('click', (event) => {
            event.preventDefault();
            action();
        });
        return element;
    };

    const create = () => {
        if (dialog) return;

        overlay = document.createElement('div');
        overlay.id = 'lightcase-overlay';
        overlay.hidden = true;
        overlay.addEventListener('click', close);

        dialog = document.createElement('div');
        dialog.id = 'lightcase-case';
        dialog.className = 'lightcase-native';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'lightcase-title');
        dialog.hidden = true;

        content = document.createElement('div');
        content.id = 'lightcase-content';
        const inner = document.createElement('div');
        inner.className = 'lightcase-contentInner';
        content.append(inner);

        const info = document.createElement('div');
        info.id = 'lightcase-info';
        title = document.createElement('h4');
        title.id = 'lightcase-title';
        caption = document.createElement('p');
        caption.id = 'lightcase-caption';
        sequence = document.createElement('div');
        sequence.id = 'lightcase-sequenceInfo';
        info.append(title, caption, sequence);
        content.append(info);

        const closeButton = button('lightcase-icon-close', 'Close', close);
        previous = button('lightcase-icon-prev', 'Previous', () => show(index - 1));
        next = button('lightcase-icon-next', 'Next', () => show(index + 1));
        dialog.append(content, closeButton, previous, next);
        document.body.append(overlay, dialog);
    };

    const mediaType = (link) => {
        if (link.getAttribute('href')?.startsWith('#')) return 'inline';
        const href = link.href;
        if (imagePattern.test(href)) return 'image';
        if (videoPattern.test(href)) return 'video';
        return 'iframe';
    };

    const render = (link) => {
        const inner = content.querySelector('.lightcase-contentInner');
        inner.replaceChildren();
        const type = mediaType(link);
        document.documentElement.dataset.lcType = type;

        let media;
        if (type === 'image') {
            media = new Image();
            media.src = link.href;
            media.alt = link.dataset.alt || link.querySelector('img')?.alt || '';
        } else if (type === 'video') {
            media = document.createElement('video');
            media.src = link.href;
            media.controls = true;
            media.autoplay = true;
        } else if (type === 'inline') {
            media = document.querySelector(link.hash)?.cloneNode(true);
            if (media) {
                const wrap = document.createElement('div');
                wrap.className = 'lightcase-inlineWrap';
                wrap.append(media);
                media = wrap;
            }
        } else {
            media = document.createElement('iframe');
            media.src = link.href;
            media.title = link.title || 'Media viewer';
            media.allow = 'autoplay; fullscreen; picture-in-picture';
            media.allowFullscreen = true;
        }

        if (!media) {
            media = document.createElement('p');
            media.className = 'lightcase-error';
            media.textContent = 'The requested content could not be displayed.';
            document.documentElement.dataset.lcType = 'error';
        }

        inner.append(media);
        title.textContent = link.title || link.dataset.title || '';
        caption.textContent = link.dataset.lcCaption || link.dataset.caption || '';
        sequence.textContent = items.length > 1 ? `${index + 1} of ${items.length}` : '';
        previous.hidden = items.length < 2;
        next.hidden = items.length < 2;
    };

    function show(nextIndex) {
        index = (nextIndex + items.length) % items.length;
        render(items[index]);
    }

    function open(link) {
        create();
        origin = link;
        const relation = link.getAttribute('data-rel');
        items = relation && relation !== 'lightcase'
            ? [...document.querySelectorAll(selector)].filter((item) => item.getAttribute('data-rel') === relation)
            : [link];
        index = Math.max(0, items.indexOf(link));
        render(link);
        document.documentElement.classList.add('lightcase-open');
        overlay.hidden = false;
        dialog.hidden = false;
        dialog.querySelector('.lightcase-icon-close').focus();
    }

    function close() {
        if (!dialog || dialog.hidden) return;
        dialog.querySelectorAll('video, audio').forEach((media) => media.pause());
        dialog.querySelectorAll('iframe').forEach((frame) => { frame.src = 'about:blank'; });
        dialog.hidden = true;
        overlay.hidden = true;
        document.documentElement.classList.remove('lightcase-open');
        delete document.documentElement.dataset.lcType;
        origin?.focus();
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest(selector);
        if (!link) return;
        event.preventDefault();
        open(link);
    });

    document.addEventListener('keydown', (event) => {
        if (!dialog || dialog.hidden) return;
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowLeft' && items.length > 1) show(index - 1);
        if (event.key === 'ArrowRight' && items.length > 1) show(index + 1);
        if (event.key === 'Tab') {
            const controls = [...dialog.querySelectorAll('a[href]:not([hidden]), button:not([hidden]), [tabindex]:not([tabindex="-1"])')];
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
})();
