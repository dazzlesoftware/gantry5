function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slideshow-id]').forEach(function (container, index) {
        let thumbs = container.dataset.slideshowThumbnails;
        let autoplay = asBool(container.dataset.slideshowAutoplay) ? { delay: container.dataset.slideshowTimeout, disableOnInteraction: false } : false;
        let touchMove = asBool(container.dataset.slideshowTouchmove);

        if(container.parents('.fp-slideshow').length > 0) {
            container.closest('.row').addClass('has-slideshow');
        }

        if(thumbs) {
            let sliderThumbs = new Swiper(container.querySelector('.g-slideshow-thumbs'), {
                spaceBetween: 10,
                slidesPerView: 1,
                loop: asBool(container.dataset.slideshowLoop),
                centeredSlides: false,
                freeMode: true,
                loopedSlides: 1, //looped slides should be the same
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
                breakpoints: {
                    // when window width is >= 320px
                    320: {
                        slidesPerView: 2,
                        loopedSlides: 2,
                        spaceBetween: 20
                    },
                    // when window width is >= 520px
                    520: {
                        slidesPerView: 3,
                        loopedSlides: 3,
                        spaceBetween: 30
                    },
                    // when window width is >= 800px
                    800: {
                        slidesPerView: 4,
                        loopedSlides: 4,
                        spaceBetween: 40
                    },
                    // when window width is >= 1000px
                    1000: {
                        slidesPerView: 5,
                        loopedSlides: 5,
                        spaceBetween: 40
                    },
                    // when window width is >= 1500px
                    1500: {
                        slidesPerView: 7,
                        loopedSlides: 7,
                        spaceBetween: 40
                    }
                }
            });
        }

        let slideSwipe = new Swiper(container, {
            speed: container.dataset.slideshowSpeed,
            loop: asBool(container.dataset.slideshowLoop),
            direction: 'vertical',
            allowTouchMove: touchMove,
            autoplay: autoplay,
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: thumbs ? { swiper: sliderThumbs } : thumbs,
            effect: container.dataset.slideshowEffect,
            fadeEffect: {
                crossFade: true
            },
            coverflowEffect: {
                rotate: 30,
                slideShadows: false,
            },
            flipEffect: {
                rotate: 30,
                slideShadows: false,
            },
            cubeEffect: {
                slideShadows: false,
            },
        });
    });
});
