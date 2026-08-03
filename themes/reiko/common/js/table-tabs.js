document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-link').forEach((tab) => tab.addEventListener('click', () => {
        const scope = tab.closest('[data-table-tabs], .g-table-tabs') || document;
        scope.querySelectorAll('.tab-link').forEach((item) => item.classList.toggle('selected', item === tab));
        scope.querySelectorAll('.g-table-tabs-wrapper').forEach((panel) => panel.classList.toggle('selected', panel.id === tab.dataset.tab));
    }));
});
