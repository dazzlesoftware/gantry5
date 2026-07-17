"use strict";
var DragEvents = require('../ui/drag.events'),
    $          = require('../utils/elements.utils');

require('elements/events');
require('elements/delegation');

var clamp = function(value, min, max) {
        return Math.min(max, Math.max(min, value));
    },
    mapRange = function(value, min1, max1, min2, max2) {
        return min2 + ((value - min1) / (max1 - min1)) * (max2 - min2);
    },
    precision = function(value, decimals) {
        var multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    };

class Resizer {
    constructor(container, options, menumanager) {
        this.DRAG_EVENTS = DragEvents;
        this.options = Object.assign({minSize: 5}, options || {});
        this.history = this.options.history || {};
        this.builder = this.options.builder || {};
        this.map = this.builder.map;
        this.menumanager = menumanager;
        this.moveHandler = this.move.bind(this);
        this.stopHandler = this.stop.bind(this);
        this.origin = {
            x: 0,
            y: 0,
            transform: null,
            offset: {
                x: 0,
                y: 0
            }
        };
    }

    getBlock(element) {
        var id = typeof element === 'string' ? element : $(element).data('lm-id') || '';
        return this.map ? this.map[id] : undefined;
    }

    getAttribute(element, prop) {
        return this.getBlock(element).getAttribute(prop);
    }

    getSize(element) {
        element = $(element);
        var parent = element.matches('[data-mm-id]') ? element : element.parent('[data-mm-id]'),
            size = parent.find('.percentage input');

        return Number(size.value());
    }

    setSize(element, size, animated) {
        element = $(element);
        animated = typeof animated === 'undefined' ? false : animated;

        var parent = element.matches('[data-mm-id]') ? element : element.parent('[data-mm-id]'),
            pc = parent.find('.percentage input');

        parent[animated ? 'animate' : 'style']({'flex': '0 1 '+size+'%'});
        pc.value(precision(size, 1));
    }

    start(event, element, siblings, offset) {
        if (event && event.type.match(/^touch/i)) { event.preventDefault(); }
        if (event.which && event.which !== 1) { return true; }

        // Stops text selection
        event.preventDefault();

        this.element = $(element);

        var parent = this.element.parent('.submenu-selector');
        if (!parent) { return false; }

        parent.addClass('moving');
        
        this.siblings = {
            occupied: 0,
            elements: siblings,
            next: this.element.parent('[data-mm-id]').nextSibling().find('> .submenu-column'),
            prevs: this.element.parent('[data-mm-id]').previousSiblings(),
            sizeBefore: 0
        };

        if (this.siblings.elements.length > 1) {
            this.siblings.occupied -= this.getSize(this.siblings.next);
            this.siblings.elements.forEach(function(sibling) {
                this.siblings.occupied += this.getSize(sibling);
            }, this);
        }

        if (this.siblings.prevs) {
            this.siblings.prevs.forEach(function(sibling) {
                this.siblings.sizeBefore += this.getSize(sibling);
            }, this);
        }

        this.origin = {
            size: this.getSize(this.element),
            maxSize: this.getSize(this.element) + this.getSize(this.siblings.next),
            x: event.changedTouches ? event.changedTouches[0].pageX : event.pageX + 6,
            y: event.changedTouches ? event.changedTouches[0].pageY : event.pageY
        };

        var clientRect = this.element[0].getBoundingClientRect(),
            parentRect = this.element.parent()[0].getBoundingClientRect();

        this.origin.offset = {
            clientRect: clientRect,
            parentRect: {left: parentRect.left, right: parentRect.right},
            x: this.origin.x - clientRect.right,
            y: clientRect.top - this.origin.y,
            down: offset
        };

        this.origin.offset.parentRect.left = this.element.parent('.submenu-selector').find('> [data-mm-id]:first-child')[0].getBoundingClientRect().left;
        this.origin.offset.parentRect.right = this.element.parent('.submenu-selector').find('> [data-mm-id]:last-child')[0].getBoundingClientRect().right;


        this.detachDocumentEvents();
        this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
            document.addEventListener(eventName, this.moveHandler, {passive: false});
        }, this);
        this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
            document.addEventListener(eventName, this.stopHandler, {passive: false});
        }, this);
    }

    move(event) {
        if (event && event.type.match(/^touch/i)) { event.preventDefault(); }

        var point = event.touches && event.touches.length ? event.touches[0] : event,
            clientX = point.clientX || 0,
            clientY = point.clientY || 0,
            parentRect = this.origin.offset.parentRect;

        var deltaX = (this.lastX || clientX) - clientX,
            deltaY = (this.lastY || clientY) - clientY;

        this.direction =
            Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0 && 'left' ||
            Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0 && 'right' ||
            Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0 && 'up' ||
                                                                 'down';
        var size,
            diff = 100 - this.siblings.occupied,
            value = clientX + (!this.siblings.prevs ? this.origin.offset.x - this.origin.offset.down : this.siblings.prevs.length),
            normalized = clamp(value, parentRect.left, parentRect.right);

        size = mapRange(normalized, parentRect.left, parentRect.right, 0, 100);
        size = size - this.siblings.sizeBefore;
        size = precision(clamp(size, this.options.minSize, this.origin.maxSize - this.options.minSize), 0);

        diff = precision(diff - size, 0);

        this.setSize(this.element, size);
        this.setSize(this.siblings.next, diff);

        // Hack to handle cases where size is not an integer
        var siblings = this.siblings.elements,
            amount = siblings ? siblings.length + 1 : 1;
        if (amount == 3 || amount == 6 || amount == 7 || amount == 8 || amount == 9 || amount == 11 || amount == 12) {
            var total = 0, blocks;

            blocks = $([siblings, this.element.parent('[data-mm-id]')]);
            blocks.forEach(function(block, index){
                block = $(block);
                size = this.getSize(block);
                if (size % 1) {
                    size = precision(100 / amount, 0);
                    this.setSize(block, size);
                }

                total += size;

                if (blocks.length == index + 1 && total != 100) {
                    diff = 100 - total;
                    this.setSize(block, (size + diff));
                }

            }, this);
        }

        this.lastX = clientX;
        this.lastY = clientY;
    }

    stop(event) {
        if (event && event.type.match(/^touch/i)) { event.preventDefault(); }

        this.detachDocumentEvents();

        this.element.parent('.submenu-selector').removeClass('moving');

        this.menumanager.emit('dragEnd', this.menumanager.map, 'resize');
        //if (this.origin.size !== this.getSize(this.element)) { this.history.push(this.builder.serialize()); }
    }

    detachDocumentEvents() {
        this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
            document.removeEventListener(eventName, this.moveHandler, {passive: false});
        }, this);
        this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
            document.removeEventListener(eventName, this.stopHandler, {passive: false});
        }, this);
    }

    updateItemSizes(elements) {
        var parent = this.element ? this.element.parent('.submenu-selector') : null;
        if (!parent && !elements) { return false; }

        var blocks = elements || parent.search('> [data-mm-id]'),
            sizes = [],
            active = $('.menu-selector .active'),
            path = active ? active.data('mm-id') : null;

        blocks.forEach(function(block){
            sizes.push(this.getSize(block));
        }, this);

        // update active path with new columns sizes
        this.menumanager.items[path].columns = sizes;

        this.updateMaxValues(elements);

        return sizes;
    }

    updateMaxValues(elements) {
        var parent = this.element ? this.element.parent('.submenu-selector') : null;
        if (!parent && !elements) { return false; }

        var blocks = elements || parent.search('> [data-mm-id]'), sizes, inputs;

        blocks.forEach(function(block){
            block = $(block);
            var sibling = block.nextSibling() || block.previousSibling();
            if (!sibling) { return; }

            inputs = {
                block: block.find('input.column-pc'),
                sibling: sibling.find('input.column-pc')
            };

            sizes = {
                current: this.getSize(block),
                sibling: this.getSize(sibling)
            };

            sizes.total = sizes.current + sizes.sibling;
            inputs.block.attribute('max', sizes.total - Number(inputs.block.attribute('min')));
            inputs.sibling.attribute('max', sizes.total - Number(inputs.sibling.attribute('min')));
        }, this);
    }

    evenResize(elements, animated) {
        var total = elements.length,
            size = precision(100 / total, 4);

        elements.forEach(function(element) {
            element = $(element);
            this.setSize(element, size, (typeof animated == 'undefined' ? false : animated));
        }, this);

        this.updateItemSizes(elements);
        this.menumanager.emit('dragEnd', this.menumanager.map, 'evenResize');
    }
}

module.exports = Resizer;
