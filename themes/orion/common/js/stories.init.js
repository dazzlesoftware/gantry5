document.addEventListener('DOMContentLoaded', () => {
    const enabled = (value) => ['1', 'true', 'enabled', 'yes'].includes(String(value).toLowerCase());
    const number = (value) => Number.parseFloat(value) || 0;
    document.querySelectorAll('[data-stories-id]').forEach((root) => {
        const container = root.querySelector('.area');
        if (!container) return;
        const breakpoint = (name) => Length.toPx(document.body, container.dataset[name]);
        new Swiper(container, {
            speed: number(container.dataset.storiesSpeed),
            loop: enabled(container.dataset.storiesLoop),
            direction: 'horizontal',
            allowTouchMove: enabled(container.dataset.storiesTouchmove),
            grabCursor: enabled(container.dataset.storiesTouchmove),
            autoplay: enabled(container.dataset.storiesAutoplay)
                ? { delay: number(container.dataset.storiesTimeout), disableOnInteraction: false }
                : false,
            navigation: {
                nextEl: root.querySelector('.stories-button-next'),
                prevEl: root.querySelector('.stories-button-prev')
            },
            effect: container.dataset.storiesEffect,
            fadeEffect: { crossFade: true },
            coverflowEffect: { rotate: 30, slideShadows: false },
            flipEffect: { rotate: 30, slideShadows: false },
            cubeEffect: { slideShadows: false },
            breakpoints: {
                [breakpoint('storiesMobileBreakpoint')]: {
                    slidesPerView: number(container.dataset.storiesMobileslides),
                    slidesPerGroup: number(container.dataset.storiesMobilegroup),
                    spaceBetween: number(container.dataset.storiesMobilespace)
                },
                [breakpoint('storiesTabletBreakpoint')]: {
                    slidesPerView: number(container.dataset.storiesTabletslides),
                    slidesPerGroup: number(container.dataset.storiesTabletgroup),
                    spaceBetween: number(container.dataset.storiesTabletspace)
                },
                [breakpoint('storiesDesktopBreakpoint')]: {
                    slidesPerView: number(container.dataset.storiesDesktopslides),
                    slidesPerGroup: number(container.dataset.storiesDesktopgroup),
                    spaceBetween: number(container.dataset.storiesDesktopspace)
                },
                [breakpoint('storiesLargedesktopBreakpoint')]: {
                    slidesPerView: number(container.dataset.storiesLargedesktopslides),
                    slidesPerGroup: number(container.dataset.storiesLargedesktopgroup),
                    spaceBetween: number(container.dataset.storiesLargedesktopspace)
                }
            }
        });
    });
});

