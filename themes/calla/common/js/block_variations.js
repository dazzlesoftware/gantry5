
// Frame wiggle
jQuery(".wiggle .g-content").append("<div class='wiggle-frame'></div>");
window.addEventListener('load', function (e) {
    window.addEventListener('mousemove', function (e) {
        var elems = jQuery(".wiggle:not(.wiggle-static)");
        for (var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            var elemOffset = elem.getBoundingClientRect();
            elem.style.transform = 'translate(' + Math.floor(-(e.clientX - elemOffset.left) / 100) + 'px, ' + Math.floor(-(e.clientY - elemOffset.top) / 200) + 'px ' + ')';
        }
    })
});

window.addEventListener('load', function (e) {
    window.addEventListener('mousemove', function (e) {
        var elems = jQuery(".wiggle:not(.wiggle-static) .wiggle-frame");
        for (var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            var elemOffset = elem.getBoundingClientRect();
            elem.style.transform = 'translate(' + Math.floor(-(e.clientX - elemOffset.left) / 69) + 'px, ' + Math.floor(-(e.clientY - elemOffset.top) / 100) + 'px ' + ')';
        }
    })
});
