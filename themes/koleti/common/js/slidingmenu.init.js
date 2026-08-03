document.addEventListener('DOMContentLoaded', function () {
    var container = document.querySelector('.slidingmenu');
    var content = document.querySelector('#g-page-surround');
    var openButton = document.getElementById('open-button');
    var closeButton = document.getElementById('close-button');
    if (!container || !content || !openButton) return;

    document.body.prepend(container);
    var overlay = container.querySelector('.slidingmenu-overlay');
    if (overlay) content.prepend(overlay);

    function toggleMenu(event) {
        if (event) event.stopPropagation();
        document.body.classList.toggle('show-menu');
    }
    openButton.addEventListener('click', toggleMenu);
    if (closeButton) closeButton.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    content.addEventListener('click', function (event) {
        if (document.body.classList.contains('show-menu') && !container.contains(event.target)) toggleMenu();
    });
});
