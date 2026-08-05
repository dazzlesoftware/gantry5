document.addEventListener('DOMContentLoaded', () => {
    const imagesReady = (container) => Promise.all([...container.querySelectorAll('img')].map((image) => (
        image.complete ? Promise.resolve() : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
        })
    )));
    document.querySelectorAll('[data-socialfeed-id]').forEach(async (container) => {
        const grid = container.querySelector('.g-socialfeed-grid');
        const token = container.dataset.socialfeedAccesstoken;
        const user = container.dataset.socialfeedUserid;
        if (token && user && container.dataset.socialfeedSource === 'instagram') {
            try {
                const parameters = new URLSearchParams({
                    fields: 'id,caption,media_url,permalink',
                    access_token: token
                });
                const response = await fetch(`https://graph.instagram.com/${encodeURIComponent(user)}/media/?${parameters}`);
                if (!response.ok) throw new Error(`Instagram request failed (${response.status})`);
                const data = await response.json();
                (data.data || []).forEach((entry) => {
                    const item = document.createElement('div');
                    item.className = 'g-socialfeed-grid-item';
                    const wrapper = document.createElement('div');
                    wrapper.className = 'g-socialfeed-grid-item-wrapper';
                    const imageBox = document.createElement('div');
                    imageBox.className = 'g-socialfeed-grid-item-image';
                    const link = document.createElement('a');
                    link.dataset.rel = `lightcase:gallery-${user}`;
                    link.href = entry.media_url;
                    link.title = entry.caption || '';
                    const image = new Image();
                    image.src = entry.media_url;
                    image.alt = entry.caption || '';
                    link.append(image);
                    imageBox.append(link);
                    wrapper.append(imageBox);
                    item.append(wrapper);
                    grid.append(item);
                });
            } catch (error) {
                console.warn('Social Feed could not be loaded.', error);
            }
        }
        await imagesReady(container);
        const navigation = container.querySelector('.g-socialfeed-nav');
        if (!grid || typeof NativeGrid === 'undefined') return;
        const buttons = [...navigation?.querySelectorAll('.g-socialfeed-nav-item') || []];
        const gridLayout = new NativeGrid(grid, {
            itemSelector: '.g-socialfeed-grid-item',
            sizer: container.querySelector('.g-socialfeed-grid-sizer'),
            randomize: true,
            group: navigation?.querySelector('.selected')?.dataset.group
        });
        buttons.forEach((button) => button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.toggle('selected', item === button));
            gridLayout.filter(button.dataset.group);
        }));
        container.classList.add('visible');
    });
});

