document.querySelectorAll('[data-miniplayer-id]').forEach((container) => {
    container.querySelectorAll('[data-miniplayer-audio-track]').forEach((track) => {
        const source = track.dataset.miniplayerAudioTrack;
        const artist = track.dataset.miniplayerAudioArtist || '';
        const title = track.dataset.miniplayerAudioTitle || '';
        const artwork = track.querySelector('.g-miniplayer-artwork');
        const button = track.querySelector('.g-miniplayer-play');
        const record = track.querySelector('.g-miniplayer-record');
        const audio = new Audio(source);
        if (artwork) {
            artwork.src = track.dataset.miniplayerAudioCover || '';
            artwork.alt = `${artist} - ${title}`;
        }
        const band = track.querySelector('.g-miniplayer-band');
        const song = track.querySelector('.g-miniplayer-track');
        if (band) band.textContent = artist;
        if (song) song.textContent = title;
        const update = (playing) => {
            track.classList.toggle('open', playing);
            record?.classList.toggle('spinning', playing);
            button?.classList.toggle('fa-play', !playing);
            button?.classList.toggle('fa-pause', playing);
        };
        button?.addEventListener('click', async (event) => {
            event.preventDefault();
            if (audio.paused) {
                await audio.play();
                update(true);
            } else {
                audio.pause();
                update(false);
            }
        });
        audio.addEventListener('ended', () => update(false));
    });
});
