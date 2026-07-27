"use strict";

const normalizeGridSizes = (root, getBlock) => {
    if (!root || typeof getBlock !== 'function') return;

    root.querySelectorAll('[data-lm-blocktype="grid"]').forEach(grid => {
        const blocks = Array.from(grid.children)
            .filter(child => child.getAttribute('data-lm-blocktype') === 'block')
            .map(element => getBlock(element.getAttribute('data-lm-id')))
            .filter(block => block && typeof block.getSize === 'function' && typeof block.setSize === 'function');

        if (!blocks.length) return;

        const total = blocks.reduce((sum, block) => {
            const size = Number(block.getSize());
            return sum + (Number.isFinite(size) ? size : 0);
        }, 0);
        let sizes;

        if (blocks.length === 1) {
            sizes = [100];
        } else if (total <= 0) {
            sizes = blocks.map(() => 100 / blocks.length);
        } else if (Math.abs(total - 100) > 0.05) {
            sizes = blocks.map(block => (block.getSize() / total) * 100);
        } else {
            return;
        }

        let applied = 0;
        blocks.forEach((block, index) => {
            const size = index === blocks.length - 1
                ? 100 - applied
                : Math.round(sizes[index] * 10) / 10;
            applied += size;
            block.setSize(size, true);
        });
    });
};

module.exports = normalizeGridSizes;
