function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-featureslider-id]').forEach(function (root, index) {
      let container = root.querySelector('.area');
      let autoplay = asBool(container.dataset.featuresliderAutoplay) ? { delay: container.dataset.featuresliderTimeout, disableOnInteraction: false } : false;
      let touchMove = asBool(container.dataset.featuresliderTouchmove);
      let touchMoveTabs = asBool(container.dataset.featuresliderTouchmovetabs);

      let thumbs = new Swiper('.g-featureslider-thumbs', {
        slidesPerView: 4,
        direction: 'vertical',
        freeMode: false,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        allowTouchMove: touchMoveTabs,
      });

      let slideSwiper = new Swiper(container, {
        speed: container.dataset.featuresliderSpeed,
        loop: asBool(container.dataset.featuresliderLoop),
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

