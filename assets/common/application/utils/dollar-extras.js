"use strict";
const $ = require('elements');

const matches = (element, expression) => element
    && element.nodeType === Node.ELEMENT_NODE
    && element.matches(expression || '*');

const adjacentSiblings = function(expression) {
    const siblings = [];

    this.forEach(element => {
        const previous = element.previousElementSibling;
        const next = element.nextElementSibling;

        if (matches(previous, expression) && !siblings.includes(previous)) {
            siblings.push(previous);
        }
        if (matches(next, expression) && !siblings.includes(next)) {
            siblings.push(next);
        }
    });

    return $(siblings);
};

const matchingSiblings = function(expression) {
    const siblings = [];

    this.forEach(element => {
        if (!element.parentElement) return;

        Array.from(element.parentElement.children).forEach(sibling => {
            if (sibling !== element && matches(sibling, expression) && !siblings.includes(sibling)) {
                siblings.push(sibling);
            }
        });
    });

    return $(siblings);
};

$.implement({
    sibling: adjacentSiblings,
    siblings: matchingSiblings
});


module.exports = $;
