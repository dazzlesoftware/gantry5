(() => {
    'use strict';

    const value = (element, name) => element.dataset[name];
    const enabled = (input) => ['1', 'true', 'enabled', 'yes'].includes(String(input).toLowerCase());
    const number = (input, fallback = 0) => {
        const parsed = Number.parseFloat(input);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const initialize = () => {
        document.querySelectorAll('[data-swiper-id]').forEach((container) => {
            const autoplay = enabled(value(container, 'swiperAutoplay'))
                ? { delay: number(value(container, 'swiperTimeout')), disableOnInteraction: false }
                : false;
            const breakpoint = (name) => Length.toPx(document.body, value(container, name));
            const selector = (name) => {
                const target = value(container, name);
                return target ? document.querySelector(target) : null;
            };
            const thumbsEnabled = enabled(value(container, 'swiperThumbnails'));
            let sliderThumbs = null;

            if (thumbsEnabled) {
                const thumbnailContainer = selector('swiperElthumb');
                if (thumbnailContainer) {
                    sliderThumbs = new Swiper(thumbnailContainer, {
                        watchSlidesProgress: true,
                        navigation: {
                            nextEl: container.querySelector('.swiper-thumbs-button-next'),
                            prevEl: container.querySelector('.swiper-thumbs-button-prev')
                        },
                        breakpoints: {
                            [breakpoint('swiperMobileBreakpoint')]: {
                                slidesPerView: number(value(container, 'swiperMobilethumbs')),
                                spaceBetween: number(value(container, 'swiperMobilethumbspace'))
                            },
                            [breakpoint('swiperTabletBreakpoint')]: {
                                slidesPerView: number(value(container, 'swiperTabletthumbs')),
                                spaceBetween: number(value(container, 'swiperTabletthumbspace'))
                            },
                            [breakpoint('swiperDesktopBreakpoint')]: {
                                slidesPerView: number(value(container, 'swiperDesktopthumbs')),
                                spaceBetween: number(value(container, 'swiperDesktopthumbspace'))
                            },
                            [breakpoint('swiperLargedesktopBreakpoint')]: {
                                slidesPerView: number(value(container, 'swiperLargedesktopthumbs')),
                                spaceBetween: number(value(container, 'swiperLargedesktopthumbspace'))
                            }
                        }
                    });
                }
            }

            const touchMove = enabled(value(container, 'swiperTouchmove'));
            const mobileTouchMove = enabled(value(container, 'swiperMobiletouchmove'));
            new Swiper(container, {
                speed: number(value(container, 'swiperSpeed')),
                loop: enabled(value(container, 'swiperLoop')),
                direction: value(container, 'swiperDirection'),
                allowTouchMove: touchMove,
                grabCursor: touchMove,
                autoplay,
                pagination: {
                    el: selector('swiperElpa'),
                    type: value(container, 'swiperPagination'),
                    clickable: true
                },
                navigation: {
                    nextEl: selector('swiperNextnav'),
                    prevEl: selector('swiperPrevnav')
                },
                thumbs: sliderThumbs ? { swiper: sliderThumbs } : undefined,
                effect: value(container, 'swiperEffect'),
                fadeEffect: { crossFade: true },
                coverflowEffect: { rotate: 30, slideShadows: false },
                flipEffect: { rotate: 30, slideShadows: false },
                breakpoints: {
                    [breakpoint('swiperMobileBreakpoint')]: {
                        slidesPerView: number(value(container, 'swiperMobileslides')),
                        slidesPerGroup: number(value(container, 'swiperMobilegroup')),
                        spaceBetween: number(value(container, 'swiperMobilespace')),
                        allowTouchMove: mobileTouchMove,
                        grabCursor: mobileTouchMove
                    },
                    [breakpoint('swiperTabletBreakpoint')]: {
                        slidesPerView: number(value(container, 'swiperTabletslides')),
                        slidesPerGroup: number(value(container, 'swiperTabletgroup')),
                        spaceBetween: number(value(container, 'swiperTabletspace'))
                    },
                    [breakpoint('swiperDesktopBreakpoint')]: {
                        slidesPerView: number(value(container, 'swiperDesktopslides')),
                        slidesPerGroup: number(value(container, 'swiperDesktopgroup')),
                        spaceBetween: number(value(container, 'swiperDesktopspace'))
                    },
                    [breakpoint('swiperLargedesktopBreakpoint')]: {
                        slidesPerView: number(value(container, 'swiperLargedesktopslides')),
                        slidesPerGroup: number(value(container, 'swiperLargedesktopgroup')),
                        spaceBetween: number(value(container, 'swiperLargedesktopspace'))
                    }
                }
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();

