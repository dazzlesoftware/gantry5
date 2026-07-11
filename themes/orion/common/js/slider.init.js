jQuery(document).ready(function () {
    jQuery('[data-slider-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('slider-autoplay') ? { delay: container.data('slider-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('slider-touchmove');
      var centered = container.data('slider-centered');
      var thumbs = container.data('slider-thumbnails');
      var mobileBreakpoint = Length.toPx(document.body, container.data('swiper-mobile-breakpoint'));
      var tabletBreakpoint = Length.toPx(document.body, container.data('swiper-tablet-breakpoint'));
      var desktopBreakpoint = Length.toPx(document.body, container.data('swiper-desktop-breakpoint')); 
      var largeDesktopBreakpoint = Length.toPx(document.body, container.data('swiper-largedesktop-breakpoint'));   
      var mobileSlides = container.data('swiper-mobileslides');
      var mobileGroup = container.data('swiper-mobilegroup');
      var mobileSpace = container.data('swiper-mobilespace');
      var tabletSlides = container.data('swiper-tabletslides');
      var tabletGroup = container.data('swiper-tabletgroup');
      var tabletSpace = container.data('swiper-tabletspace');
      var desktopSlides = container.data('swiper-desktopslides');
      var desktopGroup = container.data('swiper-desktopgroup');
      var desktopSpace = container.data('swiper-desktopspace');
      var largeDesktopSlides = container.data('swiper-largedesktopslides');
      var largeDesktopGroup = container.data('swiper-largedesktopgroup');
      var largeDesktopSpace = container.data('swiper-largedesktopspace'); 


      if (thumbs) {
        var thumbsSwiper = new Swiper(jQuery('.g-thumbs',this), {
          loop: 0,
          slidesPerView: 'auto',
          grabCursor: 0,
          autoHeight: 1,
          freeMode: 1,
          watchSlidesVisibility: true,
          watchSlidesProgress: true,
          allowTouchMove: 0,
        });
      }
  
      var slideSwiper = new Swiper(jQuery(container), {
        speed: container.data('slider-speed'),
        loop: container.data('slider-loop'),
        centeredSlides: centered,
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        thumbs: {
          swiper: thumbsSwiper
        },
        navigation: {
          nextEl: '.slider-button-next',
          prevEl: '.slider-button-prev',
        },
        effect: container.data('slider-effect'),
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
                slidesPerView: mobileSlides,
                slidesPerGroup: mobileGroup,
                spaceBetween: mobileSpace,
            },
            [tabletBreakpoint]: {
                slidesPerView: tabletSlides,
                slidesPerGroup: tabletGroup,
                spaceBetween: tabletSpace
            },
            [desktopBreakpoint]: {
                slidesPerView: desktopSlides,
                slidesPerGroup: desktopGroup,
                spaceBetween: desktopSpace
            },
            [largeDesktopBreakpoint]: {
                slidesPerView: largeDesktopSlides,
                slidesPerGroup: largeDesktopGroup,
                spaceBetween: largeDesktopSpace
            }
        }
      });
    });
  });
  