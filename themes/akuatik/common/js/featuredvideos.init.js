document.addEventListener('DOMContentLoaded', () => {
    const videoId = (value) => {
        try {
            const url = new URL(value);
            return url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
        } catch (error) {
            return null;
        }
    };
    document.querySelectorAll('[data-featuredvideos-id]').forEach(async (container) => {
        const token = container.dataset.featuredvideosAccesstoken;
        const links = [...container.querySelectorAll('.g-featuredvideos-item-yt')];
        const ids = links.map((link) => videoId(link.href)).filter(Boolean);
        if (!token || !ids.length) return;
        try {
            const parameters = new URLSearchParams({
                key: token,
                fields: 'items(statistics(likeCount))',
                part: 'statistics',
                id: ids.join(',')
            });
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${parameters}`);
            if (!response.ok) throw new Error(`YouTube request failed (${response.status})`);
            const data = await response.json();
            container.querySelectorAll('.g-featuredvideos-item-count span').forEach((count, index) => {
                count.textContent = data.items?.[index]?.statistics?.likeCount || '0';
            });
        } catch (error) {
            console.warn('Featured video statistics could not be loaded.', error);
        }
    });
});
