"use strict";

const normalizeGridColumns = (root, getBlock) => {
    if (!root || typeof getBlock !== 'function') return;

    root.querySelectorAll('[data-lm-blocktype="grid"]').forEach(grid => {
        const blocks = Array.from(grid.children)
            .filter(child => child.getAttribute('data-lm-blocktype') === 'block')
            .map(element => getBlock(element.getAttribute('data-lm-id')))
            .filter(block => block && typeof block.getColumnSpan === 'function');

        if (!blocks.length) return;

        // Bootstrap cannot give every block a positive span when a single row
        // contains more than 12 blocks. Leave those legacy rows to wrap rather
        // than silently deleting or merging content.
        if (blocks.length > 12) {
            blocks.forEach(block => {
                block.setAttribute('columns.xs', 1);
                block.applyColumnClasses();
            });
            return;
        }

        const weights = blocks.map(block => block.getColumnSpan('xs') || 1);
        const totalWeight = weights.reduce((sum, value) => sum + value, 0) || blocks.length;
        let spans = weights.slice();

        if (totalWeight !== 12) {
            const distributable = 12 - blocks.length;
            const quotas = weights.map(weight => weight / totalWeight * distributable);
            spans = quotas.map(quota => 1 + Math.floor(quota));
            let remaining = 12 - spans.reduce((sum, value) => sum + value, 0);

            quotas
                .map((quota, index) => ({ index, remainder: quota - Math.floor(quota) }))
                .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
                .slice(0, remaining)
                .forEach(item => { spans[item.index]++; });
        }

        blocks.forEach((block, index) => {
            block.setAttribute('columns.xs', spans[index]);
            block.applyColumnClasses();
        });
    });
};

export default normalizeGridColumns;
