document.querySelectorAll('[data-timeline-id]').forEach((container) => {
    const equalize = () => {
        const elements = [...container.querySelectorAll('.g-status, .g-timestamp')];
        elements.forEach((element) => { element.style.height = 'auto'; });
        const height = Math.max(0, ...elements.map((element) => element.getBoundingClientRect().height));
        elements.forEach((element) => { element.style.height = `${height}px`; });
    };
    new Swiper(container, {
        slidesPerView: 5,
        grabCursor: true,
        breakpoints: {
            435: { slidesPerView: 1 },
            975: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
            1625: { slidesPerView: 4 }
        },
        on: { init: equalize, resize: equalize }
    });
});
