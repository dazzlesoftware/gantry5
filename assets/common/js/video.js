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

    class VideoController {
        constructor(element) {
            this.element = element;
            this.video = element.querySelector('video');
            this.control = element.querySelector('.g-videolocal-play');
            this.item = element.closest('.g-video-inner');

            if (!this.video) {
                return;
            }

            this.video.addEventListener('play', () => this.sync());
            this.video.addEventListener('pause', () => this.sync());
            this.video.addEventListener('ended', () => this.sync());

            if (this.video.classList.contains('g-video-nocontrols')) {
                this.video.addEventListener('click', () => this.toggle());
            }

            if (this.control) {
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
            if (this.video.paused || this.video.ended) {
                const play = this.video.play();

                if (play instanceof Promise) {
                    play.catch(() => this.sync());
                }
            } else {
                this.video.pause();
            }
        }

        sync() {
            const playing = !this.video.paused && !this.video.ended;

            this.element.classList.toggle('is-playing', playing);
            this.element.classList.toggle('pause', playing);
            this.item?.classList.toggle('is-playing', playing);

            if (this.control) {
                this.control.classList.toggle('pause', playing);
                this.control.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
                this.control.setAttribute('aria-pressed', playing ? 'true' : 'false');
            }
        }
    }

    const initialize = (root = document) => {
        const elements = root.matches?.(SELECTOR)
            ? [root]
            : root.querySelectorAll?.(SELECTOR) || [];

        elements.forEach((element) => {
            if (!instances.has(element)) {
                instances.set(element, new VideoController(element));
            }
        });
    };

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
})();
