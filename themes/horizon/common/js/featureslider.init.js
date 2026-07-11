jQuery(document).ready(function () {
    jQuery('[data-featureslider-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('featureslider-autoplay') ? { delay: container.data('featureslider-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('featureslider-touchmove');
      var touchMoveTabs = container.data('featureslider-touchmovetabs');
  
      var thumbs = new Swiper('.g-featureslider-thumbs', {
        slidesPerView: 4,
        direction: 'vertical',
        freeMode: false,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        allowTouchMove: touchMoveTabs,
      });

      var slideSwiper = new Swiper(jQuery(container), {
        speed: container.data('featureslider-speed'),
        loop: container.data('featureslider-loop'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
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
        thumbs: {
          swiper: thumbs
        },
      });
    });
  });
  