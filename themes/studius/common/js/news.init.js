jQuery(document).ready(function () {
    jQuery('[data-news-id]').each(function (index) {
      var container = jQuery('.area', this);
      var autoplay = container.data('news-autoplay') ? { delay: container.data('news-timeout'), disableOnInteraction: false } : false;
      var touchMove = container.data('news-touchmove');
      var mobileBreakpoint = Length.toPx(document.body, container.data('news-mobile-breakpoint'));
      var tabletBreakpoint = Length.toPx(document.body, container.data('news-tablet-breakpoint'));
      var desktopBreakpoint = Length.toPx(document.body, container.data('news-desktop-breakpoint')); 
      var largeDesktopBreakpoint = Length.toPx(document.body, container.data('news-largedesktop-breakpoint'));   
      var mobileSlides = container.data('news-mobileslides');
      var mobileGroup = container.data('news-mobilegroup');
      var mobileSpace = container.data('news-mobilespace');
      var tabletSlides = container.data('news-tabletslides');
      var tabletGroup = container.data('news-tabletgroup');
      var tabletSpace = container.data('news-tabletspace');
      var desktopSlides = container.data('news-desktopslides');
      var desktopGroup = container.data('news-desktopgroup');
      var desktopSpace = container.data('news-desktopspace');
      var largeDesktopSlides = container.data('news-largedesktopslides');
      var largeDesktopGroup = container.data('news-largedesktopgroup');
      var largeDesktopSpace = container.data('news-largedesktopspace'); 

      var slidenews = new Swiper(jQuery(container), {
        speed: container.data('news-speed'),
        loop: container.data('news-loop'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        navigation: {
          nextEl: '.news-button-next',
          prevEl: '.news-button-prev',
        },
        effect: container.data('news-effect'),
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
  