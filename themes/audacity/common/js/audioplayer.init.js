(() => {
    'use strict';

    const initialize = () => {
        const containers = [...document.querySelectorAll('[data-audioplayer-id]')];
        if (!containers.length || typeof audiojs === 'undefined') return;

        const players = audiojs.createAll({
            trackEnded() {
                const container = document.getElementById(this.wrapper.id)?.closest('[data-audioplayer-id]');
                const next = container?.querySelector('li.playing')?.nextElementSibling
                    || container?.querySelector('ol li');
                next?.click();
            }
        });

        containers.forEach((container, index) => {
            if (container.dataset.audioReady) return;
            container.dataset.audioReady = 'true';
            container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;
            const player = players[index];
            const tracks = [...container.querySelectorAll('ol li')];
            if (!player || !tracks.length) return;

            const play = (track, autoplay = true) => {
                tracks.forEach((item) => item.classList.toggle('playing', item === track));
                const link = track.querySelector('a[data-src]');
                if (!link) return;
                const cover = container.querySelector('.g-audioplayer-cover');
                if (cover) {
                    cover.src = link.dataset.cover || '';
                    cover.alt = link.textContent.trim();
                }
                const info = container.querySelector('.g-audioplayer-trackinfo');
                if (info) info.textContent = link.textContent.trim();
                player.load(link.dataset.src);
                if (autoplay) player.play();
            };
            const adjacent = (direction) => {
                const current = container.querySelector('li.playing');
                const target = direction > 0 ? current?.nextElementSibling : current?.previousElementSibling;
                play(target || (direction > 0 ? tracks[0] : tracks.at(-1)));
            };

            tracks.forEach((track) => track.addEventListener('click', (event) => {
                if (event.target.closest('.g-audioplayer-button')) return;
                event.preventDefault();
                play(track);
            }));
            container.querySelector('.next')?.addEventListener('click', (event) => {
                event.preventDefault();
                adjacent(1);
            });
            container.querySelector('.previous')?.addEventListener('click', (event) => {
                event.preventDefault();
                adjacent(-1);
            });
            container.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowRight') adjacent(1);
                if (event.key === 'ArrowLeft') adjacent(-1);
                if (event.key === ' ') {
                    event.preventDefault();
                    player.playPause();
                }
            });
            play(tracks[0], false);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
