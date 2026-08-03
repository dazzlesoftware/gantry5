document.querySelectorAll('[data-simplebooking-id]:not(form)').forEach((container) => {
    const searchForm = container.querySelector('.g-simplebooking-mainform');
    const required = [...searchForm.querySelectorAll('.g-simplebooking-item-required')];
    const items = [...container.querySelectorAll('.g-simplebooking-items > .g-simplebooking-item')];
    const input = (className) => searchForm.querySelector(`.${className}`)?.value || '';
    const validate = (fields) => {
        const empty = fields.filter((field) => !field.value || field.value === '0');
        fields.forEach((field) => field.addEventListener('input', () => field.classList.remove('g-simplebooking-item-required-highlighted'), { once: true }));
        empty.forEach((field) => field.classList.add('g-simplebooking-item-required-highlighted'));
        empty[0]?.focus();
        return empty.length === 0;
    };

    container.querySelectorAll('[data-trigger="spinner"]').forEach((spinner) => {
        const field = spinner.querySelector('input');
        spinner.querySelectorAll('[data-spin]').forEach((button) => button.addEventListener('click', (event) => {
            event.preventDefault();
            const minimum = Number(field.dataset.min || 0);
            const maximum = Number(field.dataset.max || Number.MAX_SAFE_INTEGER);
            const delta = button.dataset.spin === 'up' ? 1 : -1;
            field.value = Math.min(maximum, Math.max(minimum, Number(field.value || minimum) + delta));
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }));
    });

    container.querySelector('.g-simplebooking-button')?.addEventListener('click', (event) => {
        event.preventDefault();
        if (!validate(required)) return;
        const start = new Date(input('g-simplebooking-item-id-1'));
        const end = new Date(input('g-simplebooking-item-id-2'));
        const adults = Number(input('g-simplebooking-item-id-3'));
        const children = Number(input('g-simplebooking-item-id-4'));
        items.forEach((item) => {
            const available = adults <= Number(item.dataset.adults)
                && children <= Number(item.dataset.children)
                && start >= new Date(item.dataset.start)
                && end <= new Date(item.dataset.end);
            item.hidden = !available;
        });
    });

    items.forEach((item) => {
        const list = item.querySelector('.g-simplebooking-list');
        const details = item.querySelector('.g-simplebooking-form');
        const form = details?.querySelector('form');
        item.querySelector('.g-simplebooking-item-button .button')?.addEventListener('click', (event) => {
            event.preventDefault();
            if (!validate(required)) return;
            list.hidden = true;
            details.style.display = 'block';
        });
        item.querySelector('.g-simplebooking-buttonback .button')?.addEventListener('click', (event) => {
            event.preventDefault();
            list.hidden = false;
            details.style.display = 'none';
        });
        item.querySelector('.g-simplebooking-button2 .button')?.addEventListener('click', async (event) => {
            event.preventDefault();
            const contact = [...details.querySelectorAll('.g-simplebooking-item-required')];
            if (!validate(contact)) return;
            form.querySelector('.g-simplebooking-hiddenfields-checkin').value = input('g-simplebooking-item-id-1');
            form.querySelector('.g-simplebooking-hiddenfields-checkout').value = input('g-simplebooking-item-id-2');
            form.querySelector('.g-simplebooking-hiddenfields-adults').value = input('g-simplebooking-item-id-3');
            form.querySelector('.g-simplebooking-hiddenfields-children').value = input('g-simplebooking-item-id-4');
            try {
                const response = await fetch(`https://getsimpleform.com/messages?form_api_token=${encodeURIComponent(form.dataset.simplebookingToken)}`, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) throw new Error(`Booking submission failed (${response.status})`);
                details.querySelector('.g-simplebooking-hidden').hidden = true;
                details.querySelector('.g-simplebooking-thankyou').style.display = 'block';
            } catch (error) {
                details.querySelector('.g-simplebooking-hidden').hidden = true;
                details.querySelector('.g-simplebooking-error').style.display = 'block';
            }
        });
    });
});
