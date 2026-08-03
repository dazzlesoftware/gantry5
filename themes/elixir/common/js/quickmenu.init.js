document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-quickmenu-id]').forEach((container) => {
        const thumbnails = container.querySelector('.thumbs');
        const slides = container.querySelector('.items');
        if (!thumbnails || !slides) return;
        const thumbs = new Swiper(thumbnails, {
            slidesPerView: 4,
            freeMode: true,
            watchSlidesProgress: true
        });
        new Swiper(slides, {
            spaceBetween: 20,
            thumbs: { swiper: thumbs },
            pagination: {
                el: container.querySelector('.swiper-pagination'),
                type: 'bullets',
                clickable: true
            }
        });
    });
});
