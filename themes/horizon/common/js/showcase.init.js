jQuery(document).ready(function () {
  jQuery('[data-showcase-id]').each(function (index) {
    var container = jQuery(this);
    var autoplay = container.data('showcase-autoplay') ? { delay: container.data('showcase-timeout'), disableOnInteraction: false } : false;
    var touchMove = container.data('showcase-touchmove');
    var slideDirection = container.data('showcase-direction');
    var mobileBreakpoint = Length.toPx(document.body, container.data('showcase-mobile-breakpoint'));

    var slideSwipe = new Swiper(jQuery(this), {
      speed: container.data('showcase-speed'),
      loop: container.data('showcase-loop'),
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
      effect: container.data('showcase-effect'),
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
