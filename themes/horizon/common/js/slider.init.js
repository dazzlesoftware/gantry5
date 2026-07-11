jQuery(document).ready(function () {
    jQuery('[data-slider-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('slider-autoplay') ? { delay: container.data('slider-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('slider-touchmove');
  
      var slideSwiper = new Swiper(jQuery(container), {
        speed: container.data('slider-speed'),
        loop: container.data('slider-loop'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
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
  