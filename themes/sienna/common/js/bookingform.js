document.querySelectorAll('[data-bookingform-id]').forEach((form) => {
    const visible = form.querySelector('.g-bookingform-visible');
    const hidden = form.querySelector('.g-bookingform-hidden');
    const validate = (section) => {
        const required = [...section.querySelectorAll('.g-bookingform-item-required')];
        const empty = required.filter((input) => !input.value.trim());
        required.forEach((input) => input.addEventListener('input', () => input.classList.remove('g-bookingform-item-required-highlighted'), { once: true }));
        empty.forEach((input) => input.classList.add('g-bookingform-item-required-highlighted'));
        empty[0]?.focus();
        return empty.length === 0;
    };

    form.querySelector('.g-bookingform-button1 .button')?.addEventListener('click', (event) => {
        event.preventDefault();
        if (!validate(visible)) return;
        visible.hidden = true;
        hidden.hidden = false;
        hidden.style.display = 'flex';
    });
    form.querySelector('.g-bookingform-buttonback .button')?.addEventListener('click', (event) => {
        event.preventDefault();
        visible.hidden = false;
        hidden.style.display = 'none';
    });
    form.querySelector('.g-bookingform-button2 .button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        if (!validate(hidden)) return;
        try {
            const response = await fetch(`https://getsimpleform.com/messages?form_api_token=${encodeURIComponent(form.dataset.bookingformToken)}`, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error(`Form submission failed (${response.status})`);
            visible.hidden = true;
            hidden.hidden = true;
            form.querySelector('.g-bookingform-thankyou').style.display = 'block';
        } catch (error) {
            visible.hidden = true;
            hidden.hidden = true;
            form.querySelector('.g-bookingform-error').style.display = 'block';
        }
    });
});
