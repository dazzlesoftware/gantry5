function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-showcase-id]').forEach(function (container, index) {
    var autoplay = asBool(container.dataset.showcaseAutoplay) ? { delay: container.dataset.showcaseTimeout, disableOnInteraction: false } : false;
    var touchMove = asBool(container.dataset.showcaseTouchmove);
    var slideDirection = container.dataset.showcaseDirection;
    var mobileBreakpoint = Length.toPx(document.body, container.dataset.showcaseMobileBreakpoint);

    var slideSwipe = new Swiper(container, {
      speed: container.dataset.showcaseSpeed,
      loop: asBool(container.dataset.showcaseLoop),
      slidesPerView: 1,
      centeredSlides: false,
      direction: 'horizontal',
      allowTouchMove: touchMove,
      grabCursor: touchMove,
      autoplay: autoplay,
      spaceBetween: 0,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      effect: container.dataset.showcaseEffect,
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
