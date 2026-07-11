jQuery(document).ready(function () {
    jQuery('[data-timeline-id]').each(function(index) {
        var container = jQuery(this);
        var maxHeight;

        var swiper = new Swiper(container, {
            //pagination: '.swiper-pagination',
            slidesPerView: 5,
            paginationClickable: true,
            grabCursor: true,
            paginationClickable: true,
            breakpoints: {
                // when window width is <= 320px
                435: {
                    slidesPerView: 1,
                },
                // when window width is <= 480px
                975: {
                    slidesPerView: 2,
                },
                // when window width is <= 640px
                1200: {
                    slidesPerView: 3,
                },
                1625: {
                    slidesPerView: 4,
                }
            },
            on: {
                init: function () {
                    var elementHeights = jQuery('.g-status', container).map(function () {
                        return jQuery(this).innerHeight();
                    }).get();

                    maxHeight = Math.max.apply(null, elementHeights);
                    jQuery('.g-status, .g-timestamp', container).innerHeight(maxHeight);
                },
            }
        });
    });
});
