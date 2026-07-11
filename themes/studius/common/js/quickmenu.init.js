jQuery(document).ready(function () {
    jQuery('[data-quickmenu-id]').each(function (index) {
        var container = jQuery(this);
        var thumbs = new Swiper(jQuery('.thumbs', container), {
            slidesPerView: 4,
            freeMode: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
        });

        var items = new Swiper(jQuery('.items', container), {
            spaceBetween: 20,
            thumbs: {
                swiper: thumbs
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
        });
    });
});
