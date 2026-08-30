"use strict";

const distribute = (weights, total) => {
    if (!weights.length) return [];

    const distributable = total - weights.length;
    const totalWeight = weights.reduce((sum, value) => sum + value, 0) || weights.length;
    const quotas = weights.map(weight => weight / totalWeight * distributable);
    const spans = quotas.map(quota => 1 + Math.floor(quota));
    let remaining = total - spans.reduce((sum, value) => sum + value, 0);

    quotas
        .map((quota, index) => ({ index, remainder: quota - Math.floor(quota) }))
        .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
        .slice(0, remaining)
        .forEach(item => { spans[item.index]++; });

    return spans;
};

const normalizeGridColumns = (root, getBlock, fixedBlock) => {
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

        const fixedIndex = fixedBlock ? blocks.indexOf(fixedBlock) : -1;
        if (fixedIndex !== -1) {
            const fixedSpan = Math.min(
                blocks[fixedIndex].getColumnSpan('xs') || 1,
                12 - (blocks.length - 1)
            );
            const siblingIndexes = blocks.map((block, index) => index).filter(index => index !== fixedIndex);
            const siblingWeights = siblingIndexes.map(index => blocks[index].getColumnSpan('xs') || 1);
            const siblingSpans = distribute(siblingWeights, 12 - fixedSpan);

            blocks.forEach((block, index) => {
                const siblingIndex = siblingIndexes.indexOf(index);
                const span = index === fixedIndex ? fixedSpan : siblingSpans[siblingIndex];
                block.setAttribute('columns.xs', span);
                block.applyColumnClasses();
            });
            return;
        }

        const weights = blocks.map(block => block.getColumnSpan('xs') || 1);
        const totalWeight = weights.reduce((sum, value) => sum + value, 0) || blocks.length;
        let spans = weights.slice();

        if (totalWeight !== 12) {
            spans = distribute(weights, 12);
        }

        blocks.forEach((block, index) => {
            block.setAttribute('columns.xs', spans[index]);
            block.applyColumnClasses();
        });
    });
};

export default normalizeGridColumns;
