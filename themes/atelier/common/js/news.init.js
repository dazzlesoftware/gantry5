document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-news-id]').forEach(function (root, index) {
      let container = root.querySelector('.area');
      let autoplay = (container.dataset.newsAutoplay === 'true') ? { delay: container.dataset.newsTimeout, disableOnInteraction: false } : false;
      let touchMove = (container.dataset.newsTouchmove === 'true');
      let mobileBreakpoint = Length.toPx(document.body, container.dataset.newsMobileBreakpoint);
      let tabletBreakpoint = Length.toPx(document.body, container.dataset.newsTabletBreakpoint);
      let desktopBreakpoint = Length.toPx(document.body, container.dataset.newsDesktopBreakpoint);
      let largeDesktopBreakpoint = Length.toPx(document.body, container.dataset.newsLargedesktopBreakpoint);
      let mobileSlides = container.dataset.newsMobileslides;
      let mobileGroup = container.dataset.newsMobilegroup;
      let mobileSpace = container.dataset.newsMobilespace;
      let tabletSlides = container.dataset.newsTabletslides;
      let tabletGroup = container.dataset.newsTabletgroup;
      let tabletSpace = container.dataset.newsTabletspace;
      let desktopSlides = container.dataset.newsDesktopslides;
      let desktopGroup = container.dataset.newsDesktopgroup;
      let desktopSpace = container.dataset.newsDesktopspace;
      let largeDesktopSlides = container.dataset.newsLargedesktopslides;
      let largeDesktopGroup = container.dataset.newsLargedesktopgroup;
      let largeDesktopSpace = container.dataset.newsLargedesktopspace;

      let slidenews = new Swiper(container, {
        speed: container.dataset.newsSpeed,
        loop: (container.dataset.newsLoop === 'true'),
        direction: 'horizontal',
        allowTouchMove: touchMove,
        grabCursor: touchMove,
        autoplay: autoplay,
        navigation: {
          nextEl: '.news-button-next',
          prevEl: '.news-button-prev',
        },
        effect: container.dataset.newsEffect,
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

