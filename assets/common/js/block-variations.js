document.querySelectorAll('.wiggle .genesis-content').forEach((content) => {
    const frame = document.createElement('div');
    frame.className = 'wiggle-frame';
    content.append(frame);
});
window.addEventListener('mousemove', (event) => {
    document.querySelectorAll('.wiggle:not(.wiggle-static)').forEach((element) => {
        const box = element.getBoundingClientRect();
        element.style.transform = `translate(${Math.floor(-(event.clientX - box.left) / 100)}px, ${Math.floor(-(event.clientY - box.top) / 200)}px)`;
    });
    document.querySelectorAll('.wiggle:not(.wiggle-static) .wiggle-frame').forEach((element) => {
        const box = element.getBoundingClientRect();
        element.style.transform = `translate(${Math.floor(-(event.clientX - box.left) / 69)}px, ${Math.floor(-(event.clientY - box.top) / 100)}px)`;
    });
}, { passive: true });

