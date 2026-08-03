document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-news-id]').forEach(function (root, index) {
      var container = root.querySelector('.area');
      var autoplay = (container.dataset.newsAutoplay === 'true') ? { delay: container.dataset.newsTimeout, disableOnInteraction: false } : false;
      var touchMove = (container.dataset.newsTouchmove === 'true');
      var mobileBreakpoint = Length.toPx(document.body, container.dataset.newsMobileBreakpoint);
      var tabletBreakpoint = Length.toPx(document.body, container.dataset.newsTabletBreakpoint);
      var desktopBreakpoint = Length.toPx(document.body, container.dataset.newsDesktopBreakpoint);
      var largeDesktopBreakpoint = Length.toPx(document.body, container.dataset.newsLargedesktopBreakpoint);
      var mobileSlides = container.dataset.newsMobileslides;
      var mobileGroup = container.dataset.newsMobilegroup;
      var mobileSpace = container.dataset.newsMobilespace;
      var tabletSlides = container.dataset.newsTabletslides;
      var tabletGroup = container.dataset.newsTabletgroup;
      var tabletSpace = container.dataset.newsTabletspace;
      var desktopSlides = container.dataset.newsDesktopslides;
      var desktopGroup = container.dataset.newsDesktopgroup;
      var desktopSpace = container.dataset.newsDesktopspace;
      var largeDesktopSlides = container.dataset.newsLargedesktopslides;
      var largeDesktopGroup = container.dataset.newsLargedesktopgroup;
      var largeDesktopSpace = container.dataset.newsLargedesktopspace;

      var slidenews = new Swiper(container, {
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

