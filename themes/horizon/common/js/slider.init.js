function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slider-id]').forEach(function (root, index) {
      var container = root.querySelector('.area');
      var autoplay = asBool(container.dataset.sliderAutoplay) ? { delay: container.dataset.sliderTimeout, disableOnInteraction: false } : false;
      var touchMove = asBool(container.dataset.sliderTouchmove);

      var slideSwiper = new Swiper(container, {
        speed: container.dataset.sliderSpeed,
        loop: asBool(container.dataset.sliderLoop),
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

