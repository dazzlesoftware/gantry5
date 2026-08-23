document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-comments-id]').forEach(function (root, index) {
      let container = root.querySelector('.area');
      let autoplay = (container.dataset.commentsAutoplay === 'true') ? { delay: container.dataset.commentsTimeout, disableOnInteraction: false } : false;
      let touchMove = (container.dataset.commentsTouchmove === 'true');
      let centered = container.dataset.commentsCentered;
      let thumbs = container.dataset.commentsThumbnails;
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


      if (thumbs) {
        let thumbsSwiper = new Swiper(root.querySelector('.g-comment-thumbs'), {
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

      let slideSwiper = new Swiper(container, {
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

