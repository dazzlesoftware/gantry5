document.addEventListener('DOMContentLoaded', () => {
    const enabled = (value) => ['1', 'true', 'enabled', 'yes'].includes(String(value).toLowerCase());
    document.querySelectorAll('[data-testimonials-id]').forEach((container) => {
        const slider = container.querySelector('.g-testimonials-container');
        if (!slider) return;
        const wrappers = () => slider.querySelectorAll('.g-testimonials-wrapper');
        new Swiper(slider, {
            spaceBetween: 10,
            speed: Number.parseInt(container.dataset.testimonialsSpeed, 10) || 300,
            loop: enabled(container.dataset.testimonialsLoop),
            autoplay: enabled(container.dataset.testimonialsAutoplay)
                ? { delay: Number.parseInt(container.dataset.testimonialsTimeout, 10) || 5000, disableOnInteraction: false }
                : false,
            direction: 'vertical',
            pagination: {
                el: container.querySelector('.g-testimonials-pagination, .swiper-pagination'),
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: container.querySelector('.swiper-button-next'),
                prevEl: container.querySelector('.swiper-button-prev')
            },
            on: {
                slideChangeTransitionStart() {
                    wrappers().forEach((wrapper) => { wrapper.style.transition = 'opacity 200ms'; wrapper.style.opacity = '0'; });
                },
                slideChangeTransitionEnd() {
                    wrappers().forEach((wrapper) => { wrapper.style.opacity = '1'; });
                }
            }
        });
    });
});
