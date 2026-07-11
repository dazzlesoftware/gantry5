jQuery(document).ready(function () {
    jQuery('[data-stories-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('stories-autoplay') ? { delay: container.data('stories-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('stories-touchmove');
      var mobileBreakpoint = Length.toPx(document.body, container.data('stories-mobile-breakpoint'));
      var tabletBreakpoint = Length.toPx(document.body, container.data('stories-tablet-breakpoint'));
      var desktopBreakpoint = Length.toPx(document.body, container.data('stories-desktop-breakpoint')); 
      var largeDesktopBreakpoint = Length.toPx(document.body, container.data('stories-largedesktop-breakpoint'));   
      var mobileSlides = container.data('stories-mobileslides');
      var mobileGroup = container.data('stories-mobilegroup');
      var mobileSpace = container.data('stories-mobilespace');
      var tabletSlides = container.data('stories-tabletslides');
      var tabletGroup = container.data('stories-tabletgroup');
      var tabletSpace = container.data('stories-tabletspace');
      var desktopSlides = container.data('stories-desktopslides');
      var desktopGroup = container.data('stories-desktopgroup');
      var desktopSpace = container.data('stories-desktopspace');
      var largeDesktopSlides = container.data('stories-largedesktopslides');
      var largeDesktopGroup = container.data('stories-largedesktopgroup');
      var largeDesktopSpace = container.data('stories-largedesktopspace'); 

      var slideStories = new Swiper(jQuery(container), {
        speed: container.data('stories-speed'),
        loop: container.data('stories-loop'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        navigation: {
          nextEl: '.stories-button-next',
          prevEl: '.stories-button-prev',
        },
        effect: container.data('stories-effect'),
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
  