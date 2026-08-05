document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-particlejs-id]').forEach(function (container) {
        let shape = container.dataset.particlejsShape;
        let count = Number(container.dataset.particlejsCount);
        let size = Number(container.dataset.particlejsSize);
        let color = container.dataset.particlejsColor;
        let background = container.parentElement && container.parentElement.parentElement && container.parentElement.parentElement.parentElement;
        if (background) Object.assign(background.style, { position: 'absolute', zIndex: '0', left: '0', top: '0', width: '100%', height: '100%' });

        for (x = 0; x < count; x++) {
            let randomnumber = Math.floor(Math.random() * (size - 0 + 1)) + 0;

            if(shape == 'triangle') {
                container.insertAdjacentHTML('beforeend', '<div class="g-particlesjs-item g-particlesjs-item-triangle" style="width:0;height:0;border-left:' + randomnumber + 'px solid transparent;border-right:' + randomnumber + 'px solid transparent;border-bottom:' + (randomnumber * 2) + 'px solid ' + color + '"></div>');

            } else if(shape == 'circle') {
                container.insertAdjacentHTML('beforeend', '<div class="g-particlesjs-item g-particlesjs-item-circle" style="width:' + randomnumber + 'px;height:' + randomnumber + 'px;border-radius:50%;background:' + color + '"></div>');

            } else if(shape == 'moon') {
                container.insertAdjacentHTML('beforeend', '<div class="g-particlesjs-item g-particlesjs-item-moon" style="width:' + randomnumber + 'px;height:' + randomnumber + 'px;border-radius:50%;box-shadow:' + (randomnumber / 5.33) + 'px ' + (randomnumber / 5.33) + 'px 0 0 ' + color + '"></div>');

            } else if(shape == 'pacman') {
                container.insertAdjacentHTML('beforeend', '<div class="g-particlesjs-item g-particlesjs-item-pacman" style="width:0;height:0;border-right:' + randomnumber + 'px solid transparent;border:' + randomnumber + 'px solid ' + color + ';border-radius:' + randomnumber + 'px"></div>');

            } else {
                container.insertAdjacentHTML('beforeend', '<div class="g-particlesjs-item g-particlesjs-item-square" style="width:' + randomnumber + 'px;height:' + randomnumber + 'px;background:' + color + '"></div>');

            }
        }
    });
});



