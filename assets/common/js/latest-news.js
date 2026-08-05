document.addEventListener('DOMContentLoaded', () => {
    const imagesReady = (container) => Promise.all([...container.querySelectorAll('img')].map((image) => (
        image.complete ? Promise.resolve() : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
        })
    )));

    document.querySelectorAll('[data-latestnews-id]').forEach(async (container) => {
        await imagesReady(container);
        const navigation = container.querySelector('.g-latestnews-nav');
        const grid = container.querySelector('.g-latestnews-grid');
        const sizer = container.querySelector('.g-latestnews-grid-sizer');
        if (grid && typeof NativeGrid !== 'undefined') {
            const selected = navigation?.querySelector('.selected');
            const gridLayout = new NativeGrid(grid, {
                itemSelector: '.g-latestnews-grid-item',
                sizer,
                randomize: true,
                group: selected?.dataset.group
            });
            const buttons = [...navigation?.querySelectorAll('.g-latestnews-nav-item') || []];
            navigation?.querySelector('.g-latestnews-nav-container')?.addEventListener('click', () => {
                buttons.forEach((button) => button.classList.toggle('clicked'));
            });
            buttons.forEach((button) => button.addEventListener('click', () => {
                buttons.forEach((item) => item.classList.toggle('selected', item === button));
                gridLayout.filter(button.dataset.group);
            }));
        }
        container.classList.add('visible');

        const token = container.dataset.latestnewsAccesstoken;
        const articles = [...container.querySelectorAll('[data-latestnews-url]')];
        const urls = articles.map((article) => article.dataset.latestnewsUrl).filter((url) => {
            try { new URL(url); return true; } catch (error) { return false; }
        });
        if (!token || !urls.length) return;
        try {
            const parameters = new URLSearchParams({
                fields: 'engagement',
                access_token: token,
                ids: urls.join(',')
            });
            const response = await fetch(`https://graph.facebook.com/?${parameters}`);
            if (!response.ok) throw new Error(`Facebook request failed (${response.status})`);
            const data = await response.json();
            articles.forEach((article) => {
                const engagement = data[article.dataset.latestnewsUrl]?.engagement;
                if (!engagement) return;
                const reactions = article.querySelector('.reactions');
                const comments = article.querySelector('.comments');
                if (reactions) reactions.textContent = engagement.reaction_count;
                if (comments) comments.textContent = engagement.comment_count;
            });
        } catch (error) {
            console.warn('Latest News engagement data could not be loaded.', error);
        }
    });
});

