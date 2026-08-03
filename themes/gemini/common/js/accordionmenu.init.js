document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-accordionmenu-id]').forEach(function (container) {
        container.querySelectorAll('li.g-accordionmenu-group').forEach(function (group) {
            group.addEventListener('click', function (event) {
                if (event.target.closest('a') && event.target.closest('a').getAttribute('href')) return;
                event.stopPropagation();
                container.querySelectorAll('li.g-accordionmenu-group.open').forEach(function (item) {
                    if (item !== group) item.classList.remove('open');
                });
                group.classList.toggle('open');
            });
        });
    });
});
