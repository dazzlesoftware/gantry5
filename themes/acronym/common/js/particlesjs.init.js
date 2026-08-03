document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-particlesjs-id]').forEach((container) => {
        particlesJS.load(container.id, container.dataset.particlesjsPath, () => {});
    });
});
