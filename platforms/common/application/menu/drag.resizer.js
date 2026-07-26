"use strict";
var DragEvents = require('../ui/drag.events');

var asElement = function(element) {
        return element && element.nodeType ? element : element && element[0];
    },
    asElements = function(elements) {
        if (!elements) { return []; }
        if (elements.nodeType) { return [elements]; }
        return Array.from(elements).map(asElement).filter(Boolean);
    },
    directChildren = function(element, selector) {
        return element
            ? Array.from(element.children).filter(function(child) { return child.matches(selector); })
            : [];
    },
    previousSiblings = function(element) {
        var siblings = [], previous = element ? element.previousElementSibling : null;
        while (previous) {
            siblings.unshift(previous);
            previous = previous.previousElementSibling;
        }
        return siblings;
    };

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
        this.listenerOptions = {passive: false};
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
        element = typeof element === 'string' ? element : asElement(element);
        var id = typeof element === 'string' ? element : (element && element.dataset.lmId) || '';
        return this.map ? this.map[id] : undefined;
    }

    getAttribute(element, prop) {
        return this.getBlock(element).getAttribute(prop);
    }

    getSize(element) {
        element = asElement(element);
        var parent = element && (element.matches('[data-mm-id]') ? element : element.closest('[data-mm-id]')),
            size = parent && parent.querySelector('.percentage input');

        return size ? Number(size.value) : 0;
    }

    setSize(element, size, animated) {
        element = asElement(element);
        if (!element) { return; }
        animated = typeof animated === 'undefined' ? false : animated;

        var parent = element.matches('[data-mm-id]') ? element : element.closest('[data-mm-id]'),
            pc = parent && parent.querySelector('.percentage input'),
            flex = '0 1 ' + size + '%';

        if (!parent) { return; }
        if (animated && typeof parent.animate === 'function') {
            var animation = parent.animate([
                {flex: getComputedStyle(parent).flex},
                {flex: flex}
            ], {duration: 250, easing: 'ease'});
            animation.addEventListener('finish', function() {
                parent.style.flex = flex;
            }, {once: true});
        } else {
            parent.style.flex = flex;
        }
        if (pc) { pc.value = precision(size, 1); }
    }

    start(event, element, siblings, offset) {
        if (event && event.type.match(/^touch/i)) { event.preventDefault(); }
        if (event.which && event.which !== 1) { return true; }

        // Stops text selection
        event.preventDefault();

        this.element = asElement(element);
        if (!this.element) { return false; }

        var parent = this.element.closest('.submenu-selector');
        if (!parent) { return false; }

        var current = this.element.closest('[data-mm-id]'),
            next = current && current.nextElementSibling,
            nextColumn = next && next.querySelector(':scope > .submenu-column');
        if (!current || !nextColumn) { return false; }

        parent.classList.add('moving');
        
        this.siblings = {
            occupied: 0,
            elements: asElements(siblings),
            next: nextColumn,
            prevs: previousSiblings(current),
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

        var clientRect = this.element.getBoundingClientRect(),
            parentRect = this.element.parentElement.getBoundingClientRect();

        this.origin.offset = {
            clientRect: clientRect,
            parentRect: {left: parentRect.left, right: parentRect.right},
            x: this.origin.x - clientRect.right,
            y: clientRect.top - this.origin.y,
            down: offset || 0
        };

        var blocks = directChildren(parent, '[data-mm-id]');
        if (blocks.length) {
            this.origin.offset.parentRect.left = blocks[0].getBoundingClientRect().left;
            this.origin.offset.parentRect.right = blocks[blocks.length - 1].getBoundingClientRect().right;
        }


        this.detachDocumentEvents();
        this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
            document.addEventListener(eventName, this.moveHandler, this.listenerOptions);
        }, this);
        this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
            document.addEventListener(eventName, this.stopHandler, this.listenerOptions);
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

            blocks = asElements(siblings).concat(this.element.closest('[data-mm-id]'));
            blocks.forEach(function(block, index){
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

        var parent = this.element && this.element.closest('.submenu-selector');
        if (parent) { parent.classList.remove('moving'); }

        this.menumanager.emit('dragEnd', this.menumanager.map, 'resize');
        //if (this.origin.size !== this.getSize(this.element)) { this.history.push(this.builder.serialize()); }
    }

    detachDocumentEvents() {
        this.DRAG_EVENTS.EVENTS.MOVE.forEach(function(eventName) {
            document.removeEventListener(eventName, this.moveHandler, this.listenerOptions);
        }, this);
        this.DRAG_EVENTS.EVENTS.STOP.forEach(function(eventName) {
            document.removeEventListener(eventName, this.stopHandler, this.listenerOptions);
        }, this);
    }

    updateItemSizes(elements) {
        var parent = this.element ? this.element.closest('.submenu-selector') : null;
        if (!parent && !elements) { return false; }

        var blocks = elements ? asElements(elements) : directChildren(parent, '[data-mm-id]'),
            sizes = [],
            active = document.querySelector('.menu-selector .active'),
            path = active ? active.dataset.mmId : null;

        blocks.forEach(function(block){
            sizes.push(this.getSize(block));
        }, this);

        // update active path with new columns sizes
        if (path && this.menumanager.items[path]) {
            this.menumanager.items[path].columns = sizes;
        }

        this.updateMaxValues(elements);

        return sizes;
    }

    updateMaxValues(elements) {
        var parent = this.element ? this.element.closest('.submenu-selector') : null;
        if (!parent && !elements) { return false; }

        var blocks = elements ? asElements(elements) : directChildren(parent, '[data-mm-id]'), sizes, inputs;

        blocks.forEach(function(block){
            var sibling = block.nextElementSibling || block.previousElementSibling;
            if (!sibling) { return; }

            inputs = {
                block: block.querySelector('input.column-pc'),
                sibling: sibling.querySelector('input.column-pc')
            };
            if (!inputs.block || !inputs.sibling) { return; }

            sizes = {
                current: this.getSize(block),
                sibling: this.getSize(sibling)
            };

            sizes.total = sizes.current + sizes.sibling;
            inputs.block.max = sizes.total - Number(inputs.block.min);
            inputs.sibling.max = sizes.total - Number(inputs.sibling.min);
        }, this);
    }

    evenResize(elements, animated) {
        elements = asElements(elements);
        var total = elements.length,
            size = precision(100 / total, 4);

        elements.forEach(function(element) {
            this.setSize(element, size, (typeof animated == 'undefined' ? false : animated));
        }, this);

        this.updateItemSizes(elements);
        this.menumanager.emit('dragEnd', this.menumanager.map, 'evenResize');
    }
}

module.exports = Resizer;
