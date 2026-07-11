jQuery(document).ready(function () {
  jQuery('[data-slideshow-id]').each(function (index) {
    var container = jQuery(this);
    var autoplay = container.data('slideshow-autoplay') ? { delay: container.data('slideshow-timeout'), disableOnInteraction: false } : false;
    var touchMove = container.data('slideshow-touchmove');
    var slideDirection = container.data('slideshow-direction');
    var mobileBreakpoint = Length.toPx(document.body, container.data('slideshow-mobile-breakpoint'));

    var slideSwipe = new Swiper(jQuery(this), {
      speed: container.data('slideshow-speed'),
      loop: container.data('slideshow-loop'),
      slidesPerView: 1,
      centeredSlides: true,
      direction: 'horizontal',
      allowTouchMove: touchMove,
      grabCursor: touchMove,
      autoplay: autoplay,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      effect: container.data('slideshow-effect'),
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
      breakpoints: {
        [mobileBreakpoint]: {
          slidesPerView: 1.2,
        }, 
      }     
    });
  });
});
