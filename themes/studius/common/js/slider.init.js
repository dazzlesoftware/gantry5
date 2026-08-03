function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slider-id]').forEach(function (root, index) {
      var container = root.querySelector('.area');
      var autoplay = asBool(container.dataset.sliderAutoplay) ? { delay: container.dataset.sliderTimeout, disableOnInteraction: false } : false;
      var touchMove = asBool(container.dataset.sliderTouchmove);
      var centered = container.dataset.sliderCentered;
      var thumbs = container.dataset.sliderThumbnails;
      var mobileBreakpoint = Length.toPx(document.body, container.dataset.swiperMobileBreakpoint);
      var tabletBreakpoint = Length.toPx(document.body, container.dataset.swiperTabletBreakpoint);
      var desktopBreakpoint = Length.toPx(document.body, container.dataset.swiperDesktopBreakpoint);
      var largeDesktopBreakpoint = Length.toPx(document.body, container.dataset.swiperLargedesktopBreakpoint);
      var mobileSlides = container.dataset.swiperMobileslides;
      var mobileGroup = container.dataset.swiperMobilegroup;
      var mobileSpace = container.dataset.swiperMobilespace;
      var tabletSlides = container.dataset.swiperTabletslides;
      var tabletGroup = container.dataset.swiperTabletgroup;
      var tabletSpace = container.dataset.swiperTabletspace;
      var desktopSlides = container.dataset.swiperDesktopslides;
      var desktopGroup = container.dataset.swiperDesktopgroup;
      var desktopSpace = container.dataset.swiperDesktopspace;
      var largeDesktopSlides = container.dataset.swiperLargedesktopslides;
      var largeDesktopGroup = container.dataset.swiperLargedesktopgroup;
      var largeDesktopSpace = container.dataset.swiperLargedesktopspace;


      if (thumbs) {
        var thumbsSwiper = new Swiper(container.querySelector('.g-thumbs'), {
          loop: 0,
          slidesPerView: 'auto',
          direction: 'vertical',
          spaceBetween: 30,
          grabCursor: 1,
          allowTouchMove: 0,
        });
      }

      var slideSwiper = new Swiper(container, {
        direction: 'vertical',
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
        effect: container.dataset.sliderEffect,
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

