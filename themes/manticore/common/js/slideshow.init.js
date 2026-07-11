jQuery(document).ready(function () {
    jQuery('[data-slideshow-id]').each(function (index) {
        var container = jQuery(this);
        var thumbs = container.data('slideshow-thumbnails');
        var autoplay = container.data('slideshow-autoplay') ? { delay: container.data('slideshow-timeout'), disableOnInteraction: false } : false;
        var touchMove = container.data('slideshow-touchmove');

        if(container.parents('.fp-slideshow').length > 0) {
            container.closest('.g-grid').addClass('has-slideshow');
        }

        if(thumbs) {
            var sliderThumbs = new Swiper(jQuery('.g-slideshow-thumbs', this), {
                spaceBetween: 10,
                slidesPerView: 1,
                loop: container.data('slideshow-loop'),
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

        var slideSwipe = new Swiper(jQuery(this), {
            speed: container.data('slideshow-speed'),
            loop: container.data('slideshow-loop'),
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
            effect: container.data('slideshow-effect'),
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
