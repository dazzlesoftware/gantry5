document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-pricingtable-id]').forEach((table) => {
        table.querySelectorAll('.g-pricingtable-switcher div').forEach((switcher) => {
            switcher.addEventListener('click', () => {
                table.querySelectorAll('.g-pricingtable-switcher div').forEach((item) => item.classList.toggle('active', item === switcher));
                const period = switcher.dataset.pricingtableSwitcher;
                table.querySelectorAll('.g-pricingtable-price').forEach((price) => {
                    const value = price.dataset[`pricingtable${period.charAt(0).toUpperCase() + period.slice(1)}`];
                    const output = price.querySelector('.g-pricingtable-price-span');
                    if (output && value !== undefined) output.textContent = value;
                });
            });
        });
    });
});
