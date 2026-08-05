(function () {
    'use strict';

    document.querySelectorAll('[data-testimonialslider-id]').forEach(function (container) {
        let carousel = container.querySelector('[data-testimonialslider-carousel-id]');
        if (!carousel) return;

        let items = Array.from(carousel.querySelectorAll('.g-testimonialslider-carousel-item-container'));
        let index = 0;

        function show(next) {
            index = (next + items.length) % items.length;
            items.forEach(function (item, itemIndex) {
                item.hidden = itemIndex !== index;
                item.classList.toggle('active', itemIndex === index);
            });
        }

        function control(label, direction, delta) {
            let button = document.createElement('button');
            button.type = 'button';
            button.className = 'g-testimonialslider-' + direction;
            button.setAttribute('aria-label', label);
            button.innerHTML = '<span aria-hidden="true">' + (delta < 0 ? '&#9650;' : '&#9660;') + '</span>';
            button.addEventListener('click', function () { show(index + delta); });
            return button;
        }

        if (items.length > 1) {
            carousel.before(control('Previous testimonial', 'previous', -1));
            carousel.after(control('Next testimonial', 'next', 1));
        }

        if (container.dataset.testimonialsliderMatchheight === 'enabled') {
            let block = container.closest('.g-block');
            if (block) carousel.style.minHeight = block.getBoundingClientRect().height + 'px';
        }
        show(0);
    });
}());
