jQuery(document).ready(function () {
    jQuery('[data-swiper-id]').each(function (index) {
        var container = jQuery(this);
        var autoplay = container.data('swiper-autoplay') ? {delay: container.data('swiper-timeout'), disableOnInteraction: false} : false;
        var touchMove = container.data('swiper-touchmove');
        var mobileTouchMove = container.data('swiper-mobiletouchmove');
        var slideDirection = container.data('swiper-direction');
        var slidePagination = container.data('swiper-pagination');
        var nextNav = container.data('swiper-nextnav');
        var prevNav = container.data('swiper-prevnav');
        var elPa = container.data('swiper-elpa');  
        var elThumb = container.data('swiper-elthumb');
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
        var thumbs = container.data('swiper-thumbnails');
        var mobileThumbs = container.data('swiper-mobilethumbs');
        var tabletThumbs = container.data('swiper-tabletthumbs');
        var desktopThumbs = container.data('swiper-desktopthumbs'); 
        var largeDesktopThumbs = container.data('swiper-largedesktopthumbs');
        var smallThumbSpace = container.data('swiper-smallthumbspace');
        var mobileThumbSpace = container.data('swiper-mobilethumbspace');
        var tabletThumbSpace = container.data('swiper-tabletthumbspace'); 
        var desktopThumbSpace = container.data('swiper-desktopthumbspace');
        var largeDesktopThumbSpace = container.data('swiper-largedesktopthumbspace');

        if (thumbs) {
            var sliderThumbs = new Swiper(jQuery(elThumb), {
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
                navigation: {
                    nextEl: '.swiper-thumbs-button-next',
                    prevEl: '.swiper-thumbs-button-prev',
                },
                breakpoints: {
                    [mobileBreakpoint]: {
                        slidesPerView: mobileThumbs,
                        spaceBetween: mobileThumbSpace
                    },
                    [tabletBreakpoint]: {
                        slidesPerView: tabletThumbs,
                        spaceBetween: tabletThumbSpace
                    },
                    [desktopBreakpoint]: {
                        slidesPerView: desktopThumbs,
                        spaceBetween: desktopThumbSpace
                    },
                    [largeDesktopBreakpoint]: {
                        slidesPerView: largeDesktopThumbs,
                        spaceBetween: largeDesktopThumbSpace
                    }
                }
            });
        }

        var slideSwipe = new Swiper(jQuery(this), {
            speed: container.data('swiper-speed'),
            loop: container.data('swiper-loop'),
            direction: slideDirection,
            allowTouchMove: touchMove,
            grabCursor: touchMove,
            autoplay: autoplay,
            pagination: {
                el: elPa,
                type: slidePagination,
                clickable: true,
            },
            navigation: {
                nextEl: nextNav,
                prevEl: prevNav,
            },
            thumbs: thumbs ? { swiper: sliderThumbs } : thumbs,
            effect: container.data('swiper-effect'),
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
            breakpoints: {
                [mobileBreakpoint]: {
                    slidesPerView: mobileSlides,
                    slidesPerGroup: mobileGroup,
                    spaceBetween: mobileSpace,
                    allowTouchMove: mobileTouchMove,
                    grabCursor: mobileTouchMove,
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
