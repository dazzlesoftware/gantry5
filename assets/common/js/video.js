/**
 * Native Video particle controller.
 *
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
(() => {
    'use strict';

    const SELECTOR = '[data-video-controller], [data-g-video-id]';
    const instances = new WeakMap();
    const observed = new WeakSet();
    const providerFrames = new WeakMap();

    const sendProviderCommand = (iframe, command) => {
        if (!iframe?.contentWindow) {
            return;
        }

        if (iframe.dataset.videoProvider === 'youtube') {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command === 'pause' ? 'pauseVideo' : 'playVideo',
                args: []
            }), 'https://www.youtube.com');
        }

        if (iframe.dataset.videoProvider === 'vimeo') {
            iframe.contentWindow.postMessage({
                method: command === 'pause' ? 'pause' : 'play'
            }, 'https://player.vimeo.com');
        }
    };

    class VideoController {
        constructor(element) {
            this.element = element;
            this.video = element.querySelector('video');
            this.iframe = element.querySelector('iframe[data-video-provider]');
            this.control = element.querySelector('.g-videolocal-play');
            this.item = element.closest('.g-video-inner');
            this.externalPlaying = false;

            if (!this.video && !this.iframe) {
                return;
            }

            if (this.video) {
                this.video.addEventListener('play', () => this.sync());
                this.video.addEventListener('pause', () => this.sync());
                this.video.addEventListener('ended', () => this.sync());

                if (this.video.classList.contains('g-video-nocontrols')) {
                    this.video.addEventListener('click', () => this.toggle());
                }
            }

            if (this.iframe) {
                this.iframe.addEventListener('load', () => {
                    providerFrames.set(this.iframe.contentWindow, this);

                    if (this.iframe.dataset.videoProvider === 'youtube') {
                        this.iframe.contentWindow?.postMessage(JSON.stringify({
                            event: 'listening',
                            id: this.element.id || 'g5-video'
                        }), 'https://www.youtube.com');
                    }

                    if (this.iframe.dataset.videoProvider === 'vimeo') {
                        ['play', 'pause', 'ended'].forEach((eventName) => {
                            this.iframe.contentWindow?.postMessage({
                                method: 'addEventListener',
                                value: eventName
                            }, 'https://player.vimeo.com');
                        });
                    }
                });
            }

            if (this.control && this.video) {
                this.control.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggle();
                });

                this.control.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.toggle();
                    }
                });
            }

            this.sync();
        }

        toggle() {
            if (!this.video) {
                return;
            }

            if (this.video.paused || this.video.ended) {
                const play = this.video.play();

                if (play instanceof Promise) {
                    play.catch(() => this.sync());
                }
            } else {
                this.video.pause();
            }
        }

        activate() {
            if (this.iframe?.dataset.src && !this.iframe.hasAttribute('src')) {
                this.iframe.src = this.iframe.dataset.src;
            }

            if (this.video?.dataset.videoAutoplay === 'true') {
                const play = this.video.play();
                play?.catch?.(() => this.sync());
            }
        }

        pause() {
            if (this.video && !this.video.paused) {
                this.video.pause();
            }

            if (this.iframe) {
                sendProviderCommand(this.iframe, 'pause');
                this.setExternalPlaying(false);
            }
        }

        sync() {
            if (!this.video) {
                return;
            }

            const playing = !this.video.paused && !this.video.ended;

            this.syncPlayingState(playing);
        }

        setExternalPlaying(playing) {
            this.externalPlaying = playing;
            this.syncPlayingState(playing);
        }

        syncPlayingState(playing) {
            const swiper = this.element.closest('[data-g-swiper]')?.gantrySwiper?.instance;

            this.element.classList.toggle('is-playing', playing);
            this.element.classList.toggle('pause', playing);
            this.item?.classList.toggle('is-playing', playing);

            if (this.control) {
                this.control.classList.toggle('pause', playing);
                this.control.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
                this.control.setAttribute('aria-pressed', playing ? 'true' : 'false');
            }

            if (swiper?.autoplay) {
                if (playing) {
                    swiper.autoplay.stop();
                } else if (swiper.el?.dataset.autoplay && ['1', 'true', 'enable', 'enabled', 'yes'].includes(swiper.el.dataset.autoplay.toLowerCase())) {
                    swiper.autoplay.start();
                }
            }
        }
    }

    const getControllers = (root) => {
        const elements = root?.matches?.(SELECTOR)
            ? [root]
            : Array.from(root?.querySelectorAll?.(SELECTOR) || []);

        return elements
            .map((element) => instances.get(element))
            .filter(Boolean);
    };

    const activateWithin = (root) => {
        getControllers(root).forEach((controller) => controller.activate());
    };

    const pauseWithin = (root) => {
        getControllers(root).forEach((controller) => controller.pause());
    };

    const initialize = (root = document) => {
        const elements = root.matches?.(SELECTOR)
            ? [root]
            : root.querySelectorAll?.(SELECTOR) || [];

        elements.forEach((element) => {
            if (!instances.has(element)) {
                instances.set(element, new VideoController(element));
            }

            if (!observed.has(element) && 'IntersectionObserver' in window) {
                observed.add(element);
                viewportObserver.observe(element);
            }
        });
    };

    const viewportObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const controller = instances.get(entry.target);

                if (entry.isIntersecting) {
                    controller?.activate();
                } else {
                    controller?.pause();
                }
            });
        }, {rootMargin: '200px 0px'})
        : {observe() {}};

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initialize(), {once: true});
    } else {
        initialize();
    }

    new MutationObserver((mutations) => {
        mutations.forEach(({addedNodes}) => {
            addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    initialize(node);
                }
            });
        });
    }).observe(document.documentElement, {childList: true, subtree: true});

    document.addEventListener('g5:swiper:change', (event) => {
        const swiper = event.target;
        const activeSlide = event.detail?.activeSlide;

        Array.from(swiper.querySelectorAll('.swiper-slide')).forEach((slide) => {
            if (slide === activeSlide) {
                activateWithin(slide);
            } else {
                pauseWithin(slide);
            }
        });
    });

    window.addEventListener('message', (event) => {
        if (!['https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'].includes(event.origin)) {
            return;
        }

        const controller = providerFrames.get(event.source);
        if (!controller) {
            return;
        }

        let data = event.data;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                return;
            }
        }

        if (controller.iframe.dataset.videoProvider === 'youtube' && data?.event === 'onStateChange') {
            controller.setExternalPlaying(data.info === 1);
        }

        if (controller.iframe.dataset.videoProvider === 'vimeo' && ['play', 'pause', 'ended'].includes(data?.event)) {
            controller.setExternalPlaying(data.event === 'play');
        }
    });

    window.G5Video = {
        VideoController,
        activateWithin,
        initialize,
        pauseWithin
    };
})();
