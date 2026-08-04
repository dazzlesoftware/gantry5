'use strict';

const GENESIS_PREFIX = 'data-genesis-';
const LEGACY_PREFIX = 'data-genesis-';
const GENESIS_CLASS_PREFIX = 'genesis-';
const LEGACY_CLASS_PREFIX = 'genesis-';

function mirrorAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    Array.from(element.attributes).forEach((attribute) => {
        let counterpart;

        if (attribute.name.startsWith(GENESIS_PREFIX)) {
            counterpart = LEGACY_PREFIX + attribute.name.slice(GENESIS_PREFIX.length);
        } else if (attribute.name.startsWith(LEGACY_PREFIX)) {
            counterpart = GENESIS_PREFIX + attribute.name.slice(LEGACY_PREFIX.length);
        }

        if (counterpart && !element.hasAttribute(counterpart)) {
            element.setAttribute(counterpart, attribute.value);
        }
    });

    Array.from(element.classList).forEach((className) => {
        let counterpart;
        if (className.startsWith(GENESIS_CLASS_PREFIX)) {
            counterpart = LEGACY_CLASS_PREFIX + className.slice(GENESIS_CLASS_PREFIX.length);
        } else if (className.startsWith(LEGACY_CLASS_PREFIX)) {
            counterpart = GENESIS_CLASS_PREFIX + className.slice(LEGACY_CLASS_PREFIX.length);
        }
        if (counterpart && !element.classList.contains(counterpart)) {
            element.classList.add(counterpart);
        }
    });
}

function mirrorTree(root) {
    mirrorAttributes(root);
    if (root && root.querySelectorAll) {
        root.querySelectorAll('*').forEach(mirrorAttributes);
    }
}

function initialize() {
    mirrorTree(document.documentElement);

    const observer = new MutationObserver((records) => {
        records.forEach((record) => {
            if (record.type === 'attributes') {
                mirrorAttributes(record.target);
                return;
            }
            record.addedNodes.forEach(mirrorTree);
        });
    });

    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
}

if (document.documentElement) {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
}

module.exports = { mirrorAttributes, mirrorTree };
