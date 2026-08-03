document.querySelectorAll('[data-simpleform-id]').forEach((form) => {
    const fields = form.querySelector('.g-simpleform-fields');
    const required = [...fields.querySelectorAll('.g-simpleform-item-required')];
    required.forEach((input) => input.addEventListener('input', () => input.classList.remove('g-simpleform-item-required-highlighted')));

    form.querySelector('.g-simpleform-button .button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        const empty = required.filter((input) => !input.value.trim());
        empty.forEach((input) => input.classList.add('g-simpleform-item-required-highlighted'));
        if (empty.length) {
            empty[0].focus();
            return;
        }

        try {
            const response = await fetch(`https://getsimpleform.com/messages?form_api_token=${encodeURIComponent(form.dataset.simpleformToken)}`, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error(`Form submission failed (${response.status})`);
            fields.hidden = true;
            form.querySelector('.g-simpleform-thankyou').style.display = 'block';
        } catch (error) {
            fields.hidden = true;
            form.querySelector('.g-simpleform-error').style.display = 'block';
        }
    });
});
