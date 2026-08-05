(() => {
    'use strict';

    const abortController = new AbortController();
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || link.hash.length < 2) return;

        let target;
        try {
            target = document.querySelector(link.hash);
        } catch {
            return;
        }
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
        history.pushState(null, '', link.hash);
    }, { signal: abortController.signal });

    window.GenesisSmoothScroll = {
        destroy: () => abortController.abort()
    };
})();
