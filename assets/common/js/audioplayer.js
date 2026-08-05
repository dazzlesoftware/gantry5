(() => {
    'use strict';

    const selector = '[data-audioplayer]';
    const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

        const total = Math.floor(seconds);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const remainder = total % 60;
        const clock = `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;

        return hours ? `${hours}:${clock}` : clock;
    };

    class AudioPlayer {
        constructor(container) {
            this.container = container;
            this.controls = container.querySelector('[data-audioplayer-controls]');
            this.audio = this.controls?.querySelector('audio');
            this.tracks = [...container.querySelectorAll('[data-audioplayer-track]')];

            if (!this.controls || !this.audio || !this.tracks.length) return;

            this.playPause = this.controls.querySelector('.play-pause');
            this.scrubber = this.controls.querySelector('.scrubber');
            this.progress = this.controls.querySelector('.progress');
            this.loaded = this.controls.querySelector('.loaded');
            this.played = this.controls.querySelector('.played');
            this.duration = this.controls.querySelector('.duration');
            this.errorMessage = this.controls.querySelector('.error-message');
            this.trackInfo = container.querySelector('.g-audioplayer-trackinfo');
            this.cover = container.querySelector('.g-audioplayer-cover');
            this.currentIndex = 0;

            this.bindEvents();
            this.select(0, false);
            container.dataset.audioReady = 'true';
        }

        bindEvents() {
            this.tracks.forEach((track, index) => {
                track.querySelector('[data-src]')?.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.select(index, true);
                });
            });

            this.controls.querySelector('.previous')?.addEventListener('click', () => this.adjacent(-1));
            this.controls.querySelector('.next')?.addEventListener('click', () => this.adjacent(1));
            this.playPause?.addEventListener('click', () => this.toggle());
            this.scrubber?.addEventListener('click', (event) => this.seekFromPointer(event));
            this.scrubber?.addEventListener('keydown', (event) => this.seekFromKeyboard(event));

            this.container.addEventListener('keydown', (event) => {
                if (event.target !== this.container) return;
                if (event.key === 'ArrowRight') this.adjacent(1);
                if (event.key === 'ArrowLeft') this.adjacent(-1);
                if (event.key === ' ') {
                    event.preventDefault();
                    this.toggle();
                }
            });

            this.audio.addEventListener('loadstart', () => this.setState('loading'));
            this.audio.addEventListener('canplay', () => this.setState(this.audio.paused ? 'ready' : 'playing'));
            this.audio.addEventListener('play', () => this.setState('playing'));
            this.audio.addEventListener('pause', () => this.setState('ready'));
            this.audio.addEventListener('timeupdate', () => this.updateTime());
            this.audio.addEventListener('durationchange', () => this.updateTime());
            this.audio.addEventListener('progress', () => this.updateBuffered());
            this.audio.addEventListener('ended', () => this.adjacent(1));
            this.audio.addEventListener('error', () => this.showError());
        }

        select(index, autoplay) {
            const nextIndex = (index + this.tracks.length) % this.tracks.length;
            const track = this.tracks[nextIndex];
            const link = track?.querySelector('[data-src]');
            if (!link) return;

            this.currentIndex = nextIndex;
            this.tracks.forEach((item, itemIndex) => {
                const selected = itemIndex === nextIndex;
                item.classList.toggle('playing', selected);
                item.toggleAttribute('aria-current', selected);
            });

            const label = link.textContent.trim();
            if (this.trackInfo) this.trackInfo.textContent = label;
            if (this.cover) {
                const source = link.dataset.cover;
                this.cover.alt = source ? label : '';
                this.cover.hidden = !source;
                if (source) this.cover.src = source;
                else this.cover.removeAttribute('src');
            }

            this.errorMessage.textContent = '';
            this.audio.src = link.dataset.src;
            this.audio.load();
            this.updateTime();
            this.updateBuffered();
            if (autoplay) this.play();
        }

        adjacent(direction) {
            this.select(this.currentIndex + direction, true);
        }

        async play() {
            try {
                await this.audio.play();
            } catch (error) {
                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') this.showError();
            }
        }

        toggle() {
            if (this.audio.paused) this.play();
            else this.audio.pause();
        }

        seek(fraction) {
            if (!Number.isFinite(this.audio.duration)) return;
            this.audio.currentTime = clamp(fraction, 0, 1) * this.audio.duration;
        }

        seekFromPointer(event) {
            const bounds = this.scrubber.getBoundingClientRect();
            if (!bounds.width) return;
            this.seek((event.clientX - bounds.left) / bounds.width);
        }

        seekFromKeyboard(event) {
            const directions = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
            if (event.key === 'Home') {
                event.preventDefault();
                this.seek(0);
                return;
            }
            if (event.key === 'End') {
                event.preventDefault();
                this.seek(1);
                return;
            }
            if (!(event.key in directions) || !Number.isFinite(this.audio.duration)) return;
            event.preventDefault();
            this.audio.currentTime = clamp(this.audio.currentTime + directions[event.key], 0, this.audio.duration);
        }

        updateTime() {
            const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
            const percent = duration ? (this.audio.currentTime / duration) * 100 : 0;

            this.played.textContent = formatTime(this.audio.currentTime);
            this.duration.textContent = formatTime(duration);
            this.progress.style.width = `${percent}%`;
            this.scrubber.setAttribute('aria-valuenow', String(Math.round(percent)));
            this.scrubber.setAttribute('aria-valuetext', `${formatTime(this.audio.currentTime)} of ${formatTime(duration)}`);
        }

        updateBuffered() {
            if (!this.audio.buffered.length || !Number.isFinite(this.audio.duration)) {
                this.loaded.style.width = '0%';
                return;
            }
            const end = this.audio.buffered.end(this.audio.buffered.length - 1);
            this.loaded.style.width = `${clamp((end / this.audio.duration) * 100, 0, 100)}%`;
        }

        setState(state) {
            this.controls.classList.toggle('playing', state === 'playing');
            this.controls.classList.toggle('loading', state === 'loading');
            this.controls.classList.remove('error');
            this.playPause?.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
        }

        showError() {
            this.controls.classList.remove('playing', 'loading');
            this.controls.classList.add('error');
            this.errorMessage.textContent = 'This audio track could not be played.';
        }
    }

    const initialize = (root = document) => {
        const containers = root.matches?.(selector)
            ? [root]
            : [...root.querySelectorAll(selector)];
        containers.forEach((container) => {
            if (!container.dataset.audioReady) new AudioPlayer(container);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initialize(), { once: true });
    } else {
        initialize();
    }

    new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
            if (node instanceof Element) initialize(node);
        }));
    }).observe(document.documentElement, { childList: true, subtree: true });
})();
