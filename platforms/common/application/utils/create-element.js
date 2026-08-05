import __module0 from './dom-collection.js';

"use strict";

const dom = __module0;

const attributePattern = /\[\s*([^\s~|^$*=\]]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]/g;
const classPattern = /\.([a-zA-Z_][\w-]*)/g;
const idPattern = /#([a-zA-Z_][\w-]*)/;
const tagPattern = /^\s*([a-zA-Z][\w-]*)/;

export default function createElement(expression, ownerDocument) {
    const definition = String(expression || 'div');
    const tag = (definition.match(tagPattern) || [null, 'div'])[1];
    const element = (ownerDocument || document).createElement(tag);
    const id = definition.match(idPattern);
    const classes = [];
    let match;

    while ((match = classPattern.exec(definition))) {
        classes.push(match[1]);
    }

    if (id) element.id = id[1];
    if (classes.length) element.className = classes.join(' ');

    while ((match = attributePattern.exec(definition))) {
        const value = match[2] !== undefined ? match[2]
            : (match[3] !== undefined ? match[3]
                : (match[4] !== undefined ? match[4] : ''));
        element.setAttribute(match[1], value);
    }

    return dom(element);
};
