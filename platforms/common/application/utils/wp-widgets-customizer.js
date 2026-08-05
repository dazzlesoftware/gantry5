'use strict';

export default (field) => {
    const input = field && field[0] ? field[0] : field;
    if (!(input instanceof Element)) return false;
    if (!document.body.classList.contains('wp-customizer') &&
        !document.body.classList.contains('widgets-php')) return false;

    // A native bubbling event reaches WordPress's delegated widget listeners,
    // including listeners registered through legacy DOM libraries, without depending on them.
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const parent = input.parentElement;
    const title = parent ? parent.querySelector('.g-instancepicker-title') : null;
    if (title) {
        setTimeout(() => {
            const indicator = title.querySelector('.fa-spinner');
            if (indicator) indicator.remove();
        }, 5);
    }

    return true;
};
