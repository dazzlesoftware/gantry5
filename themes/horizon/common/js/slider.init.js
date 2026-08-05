function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slider-id]').forEach(function (root, index) {
      let container = root.querySelector('.area');
      let autoplay = asBool(container.dataset.sliderAutoplay) ? { delay: container.dataset.sliderTimeout, disableOnInteraction: false } : false;
      let touchMove = asBool(container.dataset.sliderTouchmove);

      let slideSwiper = new Swiper(container, {
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

