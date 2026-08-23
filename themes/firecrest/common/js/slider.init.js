function asBool(value) { return value === true || value === 'true' || value === '1'; }

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-slider-id]').forEach(function (root, index) {
      let autoplay = asBool(container.dataset.sliderAutoplay) ? { delay: container.dataset.sliderTimeout, disableOnInteraction: false } : false;
      let touchMove = asBool(container.dataset.sliderTouchmove);
      let centered = container.dataset.sliderCentered;
      let mobileBreakpoint = Length.toPx(document.body, container.dataset.swiperMobileBreakpoint);
      let tabletBreakpoint = Length.toPx(document.body, container.dataset.swiperTabletBreakpoint);
      let desktopBreakpoint = Length.toPx(document.body, container.dataset.swiperDesktopBreakpoint);
      let largeDesktopBreakpoint = Length.toPx(document.body, container.dataset.swiperLargedesktopBreakpoint);
      let mobileSlides = container.dataset.swiperMobileslides;
      let mobileGroup = container.dataset.swiperMobilegroup;
      let mobileSpace = container.dataset.swiperMobilespace;
      let tabletSlides = container.dataset.swiperTabletslides;
      let tabletGroup = container.dataset.swiperTabletgroup;
      let tabletSpace = container.dataset.swiperTabletspace;
      let desktopSlides = container.dataset.swiperDesktopslides;
      let desktopGroup = container.dataset.swiperDesktopgroup;
      let desktopSpace = container.dataset.swiperDesktopspace;
      let largeDesktopSlides = container.dataset.swiperLargedesktopslides;
      let largeDesktopGroup = container.dataset.swiperLargedesktopgroup;
      let largeDesktopSpace = container.dataset.swiperLargedesktopspace;

      let slideSwiper = new Swiper(container, {
        speed: container.dataset.sliderSpeed,
        loop: asBool(container.dataset.sliderLoop),
        centeredSlides: centered,
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
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

