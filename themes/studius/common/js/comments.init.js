document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-comments-id]').forEach(function (root, index) {
      var container = root.querySelector('.area');
      var autoplay = (container.dataset.commentsAutoplay === 'true') ? { delay: container.dataset.commentsTimeout, disableOnInteraction: false } : false;
      var touchMove = (container.dataset.commentsTouchmove === 'true');
      var centered = container.dataset.commentsCentered;
      var thumbs = container.dataset.commentsThumbnails;
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
        var thumbsSwiper = new Swiper(root.querySelector('.g-comment-thumbs'), {
          loop: 0,
          slidesPerView: '1',
          direction: 'horizontal',
          spaceBetween: 30,
          freeMode: true,
          watchSlidesProgress: true,

          breakpoints: {
            [mobileBreakpoint]: {
                slidesPerView: 1,
            },
            [tabletBreakpoint]: {
                slidesPerView: 2,
            },
            [desktopBreakpoint]: {
                slidesPerView: 4,
            },
            [largeDesktopBreakpoint]: {
                slidesPerView: 4,
            }
        }
        });
      }

      var slideSwiper = new Swiper(container, {
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        thumbs: {
          swiper: thumbsSwiper
        },
        navigation: {
          nextEl: '.comments-button-next',
          prevEl: '.comments-button-prev',
        },
        effect: container.dataset.commentsEffect,
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

