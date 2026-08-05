const initializeToTop = () => {
    const toTop = document.querySelector('#g-totop');
    if (!toTop) {
        return;
    }

    toTop.addEventListener('click', (event) => {
        event.preventDefault();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToTop, { once: true });
} else {
    initializeToTop();
}
