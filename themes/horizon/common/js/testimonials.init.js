jQuery(document).ready(function () {
    jQuery('[data-testimonials-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('testimonials-autoplay') ? { delay: container.data('testimonials-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('testimonials-touchmove');
      
      var slideSwiper = new Swiper(jQuery(container), {
        speed: container.data('testimonials-speed'),
        loop: container.data('testimonials-loop'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        effect: container.data('testimonials-effect'),
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
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
  