jQuery(document).ready(function () {
    jQuery('[data-testimonials-id]').each(function (index) {
        var container = jQuery(this);
        var slider = jQuery(".g-testimonials-container", container);
        var pagination = jQuery(".g-testimonials-pagination", container);
        var autoplay = container.data('testimonials-autoplay') ? {delay: container.data('testimonials-timeout'), disableOnInteraction: false} : false;

        var testimonialsSwiper = new Swiper(slider, {
            spaceBetween: 10,
            speed: container.data('testimonials-speed'),
            loop: container.data('testimonials-loop'),
            autoplay: autoplay,
            direction: 'vertical',
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                slideChangeTransitionStart: function () {
                    jQuery(this.$el).find('.g-testimonials-wrapper').fadeOut(200);
                },
                slideChangeTransitionEnd: function () {
                    jQuery(this.$el).find('.g-testimonials-wrapper').fadeIn(200);
                },
            },
        });
    });
});
