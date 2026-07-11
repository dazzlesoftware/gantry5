jQuery(document).ready(function () {
    jQuery('[data-particlejs-id]').each(function (index) {
        var shape = jQuery(this).data('particlejs-shape');
        var count = jQuery(this).data('particlejs-count');
        var size = jQuery(this).data('particlejs-size');
        var color = jQuery(this).data('particlejs-color');

        jQuery(this).parent().parent().parent().css("position", "absolute").css("z-index", "0").css("left", "0").css("top", "0").css("width", "100%").css("height", "100%");

        for (x = 0; x < count; x++) {
            var randomnumber = Math.floor(Math.random() * (size - 0 + 1)) + 0;

            if(shape == 'triangle') {
                jQuery(this).append('<div class="g-particlesjs-item g-particlesjs-item-triangle" style="width: 0px; height: 0px; border-left: ' + randomnumber + 'px solid transparent; border-right: ' + randomnumber + 'px solid transparent; border-bottom: ' + (randomnumber * 2) + 'px solid ' + color + ';"></div>');

            } else if(shape == 'circle') {
                jQuery(this).append('<div class="g-particlesjs-item g-particlesjs-item-circle" style="width: ' + randomnumber + 'px; height: ' + randomnumber + 'px; border-radius: 50%; background: ' + color + ';"></div>');

            } else if(shape == 'moon') {
                jQuery(this).append('<div class="g-particlesjs-item g-particlesjs-item-moon" style="width: ' + randomnumber + 'px; height: ' + randomnumber + 'px; border-radius: 50%; box-shadow: ' + (randomnumber / 5.33) + 'px ' + (randomnumber / 5.33) + 'px 0 0 ' + color + ';"></div>');

            } else if(shape == 'pacman') {
                jQuery(this).append('<div class="g-particlesjs-item g-particlesjs-item-pacman" style="width: 0px; height: 0px; border-right: ' + randomnumber + 'px solid transparent; border-top: ' + randomnumber + 'px solid ' + color + '; border-left: ' + randomnumber + 'px solid ' + color + '; border-bottom: ' + randomnumber + 'px solid ' + color + '; border-top-left-radius: ' + randomnumber + 'px; border-top-right-radius: ' + randomnumber + 'px; border-bottom-left-radius: ' + randomnumber + 'px; border-bottom-right-radius: ' + randomnumber + 'px;"></div>');

            } else {
                jQuery(this).append('<div class="g-particlesjs-item g-particlesjs-item-square" style="width: ' + randomnumber + 'px; height: ' + randomnumber + 'px; background: ' + color + ';"></div>');

            }
        }
    });
});




