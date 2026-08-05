"use strict";
var EventEmitter = require('../utils/event-emitter'),
    dom          = require('../utils/dom-effects'),
    zen        = require('../utils/create-element'),
    Blocks     = require('./blocks'),
    DragDrop   = require('../ui/drag.drop'),
    Eraser     = require('../ui/eraser'),
    flags      = require('../utils/flags-state'),
    Resizer    = require('./drag.resizer'),
    deepEquals = require('../utils/deep-equals');

var get = function(object, key) {
        return object ? object[key] : undefined;
    },
    keys = function(object) {
        return Object.keys(object || {});
    },
    precision = function(value, decimals) {
        var multiplier = Math.pow(10, decimals);
        return Math.round(Number(value) * multiplier) / multiplier;
    },
    find = function(collection, callback) {
        return Array.prototype.find.call(collection || [], callback);
    },
    contains = function(collection, value) {
        return Array.prototype.indexOf.call(collection || [], value) !== -1;
    },
    forEach = function(collection, callback, context) {
        if (Array.isArray(collection) || (collection && typeof collection.length === 'number')) {
            Array.prototype.forEach.call(collection, callback, context);
        } else {
            Object.keys(collection || {}).forEach(function(key) {
                callback.call(context, collection[key], key, collection);
            });
        }
    };

var singles = {
    disable: function() {
        var grids = dom('[data-lm-root] [data-lm-blocktype="grid"]');
        if (grids) { grids.removeClass('no-hover'); }
    },
    enable: function() {
        var grids = dom('[data-lm-root] [data-lm-blocktype="grid"]');
        if (grids) { grids.addClass('no-hover'); }
    },
    cleanup: function(builder, dropLast, start) {
        var emptyGrids = start ? start.search('> .g-grid:empty') : dom('[data-lm-blocktype="section"] > .g-grid:empty, [data-lm-blocktype="container"] > .g-grid:empty, [data-lm-blocktype="offcanvas"] > .g-grid:empty');

        if (emptyGrids) {
            emptyGrids.forEach(function(grid) {
                grid = dom(grid);
                // empty grids should go away unless they are last and/or dropLast is true
                if (grid.nextSibling('[data-lm-id]') || dropLast) {
                    builder.remove(grid.data('lm-id'));
                    grid.remove();
                }
            });
        }
    }

};

var LayoutManagerDefinition = {
    options: {},

    initialize: function(element, options) {
        this.setOptions(options);
        this.refElement = element;

        if (!element || !dom(element)) { return; }

        this.init(element);
    },

    init: function() {
        if (this.dragdrop) { this.dragdrop.detach(); }
        this.dragdrop = new DragDrop(this.refElement, this.options);
        this.resizer = new Resizer(this.refElement, this.options);
        this.eraser = new Eraser('[data-lm-eraseblock]', this.options);
        this.dragdrop
            .on('dragdrop:start', this.bound('start'))
            .on('dragdrop:location', this.bound('location'))
            .on('dragdrop:nolocation', this.bound('nolocation'))
            .on('dragdrop:resize', this.bound('resize'))
            .on('dragdrop:stop:erase', this.bound('removeElement'))
            .on('dragdrop:stop', this.bound('stop'))
            .on('dragdrop:stop:animation', this.bound('stopAnimation'));

        this.builder = this.options.builder;
        this.history = this.options.history;
        this.savestate = this.options.savestate || null;

        singles.disable();
    },

    refresh: function() {
        if (!this.refElement || !dom(this.refElement)) { return; }
        this.init();
    },

    singles: function(mode, builder, dropLast, start) {
        singles[mode](builder, dropLast, start);
    },

    clear: function(parent, options) {
        var type, child,
            filter = !parent ? [] : (parent.search('[data-lm-id]') || []).map(function(element) { return dom(element).data('lm-id'); });

        options = options || { save: true, dropLastGrid: false, emptyInherits: false };

        forEach(this.builder.map, function(obj, id) {
            if (filter.length && !contains(filter, id)) { return; }
            if (!options.emptyInherits && obj.block.parent('.g-inheriting')) { return; }

            type = obj.getType();
            child = obj.block.find('> [data-lm-id]');
            if (child) { child = child.data('lm-blocktype'); }
            if (contains(['particle', 'spacer', 'position', 'widget', 'system', 'block'], type) && (type == 'block' && (child && (child !== 'section' && child !== 'container')))) {
                this.builder.remove(id);
                obj.block.remove();
            } else if (options.emptyInherits && (type == 'section' || type == 'offcanvas' || type == 'container')) {
                if (obj.hasInheritance) {
                    obj.inherit = {};
                    obj.disableInheritance();
                }
            }
        }, this);

        this.singles('cleanup', this.builder, options.dropLastGrid, parent);
        if (options.save) { this.history.push(this.builder.serialize(), this.history.get().preset); }
    },

    updatePendingChanges: function() {
        var saveData   = this.savestate.getData(),
            serialData = this.builder.serialize(null, true),
            different  = false,

            equals     = deepEquals(saveData, serialData),
            save       = dom('[data-save="Layout"]'),
            icon       = save.find('i'),
            indicator  = save.find('.changes-indicator');

        if (equals && indicator) { save.hideIndicator(); }
        if (!equals && !indicator) { save.showIndicator('changes-indicator far fa-fw fa-circle') }
        flags.set('pending', !equals);

        // Emits the changed event for all particles
        // Used for UI to show particles where there have been differences applied
        // After a saved state
        var saved, current, id;
        serialData.forEach(function(block) {
            id = keys(block)[0];
            saved = find(saveData, function(data) { return data[id]; });
            current = find(serialData, function(data) { return data[id]; });
            different = !deepEquals(saved, current);

            id = this.builder.get(id);
            if (id) { id.emit('changed', different); }
        }, this);
    },

    start: function(event, element) {
        var root = dom('[data-lm-root]'),
            size = dom(element).position(),
            coords = dom(element)[0].getBoundingClientRect();

        var stalePlaceholders = root.search('.original-placeholder');
        if (stalePlaceholders) { stalePlaceholders.remove(); }

        this.block = null;
        this.mode = root.data('lm-root') || 'page';

        root.addClass('moving');

        var type  = dom(element).data('lm-blocktype'),
            clone = element[0].cloneNode(true);

        if (!this.placeholder) { this.placeholder = zen('div.block.placeholder[data-lm-placeholder]'); }
        this.placeholder.style({ display: 'none' });

        clone = dom(clone);
        this.original = clone.after(element).style({
            display: clone.hasClass('g-grid') ? 'flex' : 'block',
            opacity: 0.5
        }).addClass('original-placeholder').data('lm-dropzone', null);

        if (type === 'grid') { this.original.style({ display: 'flex' }); }

        this.originalType = type;

        this.block = get(this.builder.map, element.data('lm-id') || '') || new Blocks[type]({
                builder: this.builder,
                subtype: element.data('lm-subtype'),
                title: element.text()
            });

        if (!this.block.isNew()) {
            // Keep the source dimensions without painting a second copy of the
            // complete layout block while the original follows the pointer.
            this.original.style({
                visibility: 'visible',
                opacity: 1,
                pointerEvents: 'none',
                background: 'repeating-linear-gradient(135deg, #f4f4f4, #f4f4f4 10px, #e9e9e9 10px, #e9e9e9 20px)',
                boxShadow: 'inset 0 0 0 2px #c8c8c8'
            });
            var placeholderContents = this.original.search('*');
            if (placeholderContents) { placeholderContents.style({ visibility: 'hidden' }); }
            element.style({
                position: 'fixed',
                zIndex: 2500,
                opacity: 0.75,
                margin: 0,
                width: Math.ceil(size.width),
                height: Math.ceil(size.height),
                left: coords.left,
                top: coords.top,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
            }).find('[data-lm-blocktype]');

            if (this.block.getType() === 'grid') {
                var siblings = this.block.block.siblings(':not(.original-placeholder):not(.section-header):not(.g-inherit):not(:empty)');
                if (siblings) {
                    siblings.search('[data-lm-id]').style({ 'pointer-events': 'none' });
                }
            }

            this.placeholder.before(element);
            this.eraser.show();
        } else {
            var position = element.position();
            this.original.style({
                position: 'fixed',
                opacity: 0.75,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
            }).style({
                left: coords.left,
                top: coords.top,
                width: position.width,
                height: position.height
            });
            this.element = this.dragdrop.element;
            this.dragdrop.element = this.original;
        }

        var blocks;
        if (type === 'grid' && (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])'))) {
            blocks.style({ 'pointer-events': 'none' });
        }

        singles.enable();
    },

    location: function(event, location, target/*, element*/) {
        target = dom(target);
        (!this.block.isNew() ? this.original : this.element).style({ transform: 'translate(0, 0)' });
        if (!this.placeholder) { this.placeholder = zen('div.block.placeholder[data-lm-placeholder]').style({ display: 'none' }); }

        var position,
            dataType     = target.data('lm-blocktype'),
            originalType = this.block.getType();

        if (!dataType && target.data('lm-root')) { dataType = 'root'; }
        if (this.mode !== 'page' && dataType === 'section') { return; }
        if (dataType === 'grid' && (target.parent().data('lm-root') || (target.parent().data('lm-blocktype') === 'container' && target.parent().parent().data('lm-root')))) { return; }

        // Check for adjacents and avoid inserting any placeholder since it would be the same position
        var exclude   = ':not(.placeholder):not([data-lm-id="' + this.original.data('lm-id') + '"])',
            adjacents = {
                before: this.original.previousSiblings(exclude),
                after: this.original.nextSiblings(exclude)
            };

        if (adjacents.before) { adjacents.before = dom(adjacents.before[0]); }
        if (adjacents.after) { adjacents.after = dom(adjacents.after[0]); }

        if (dataType === 'block' && ((adjacents.before === target && location.x === 'after') || (adjacents.after === target && location.x === 'before'))) {
            return;
        }
        if (dataType === 'grid' && ((adjacents.before === target && location.y === 'below') || (adjacents.after === target && location.y === 'above'))) {
            return;
        }

        var nonVisible = target.parent('[data-lm-blocktype="atoms"]'),
            child      = this.block.block.find('[data-lm-id]');

        if ((child ? child.data('lm-blocktype') : originalType) == 'atom') {
            if (!nonVisible) { return; }
        } else {
            if (nonVisible) { return; }
        }

        // handles the types cases and normalizes the locations (x and y)
        var grid, block, method;

        switch (dataType) {
            case 'root':
            case 'section':
                break;
            case 'grid':
                var empty = !target.children(':not(.placeholder)');
                // new particles cannot be dropped in existing grids, only empty ones
                if (originalType !== 'grid' && !empty) { return; }


                if (empty) {
                    if (originalType === 'grid') {
                        this.placeholder.before(target);
                    } else {
                        // we are dropping a new particle into an empty grid, placeholder goes inside
                        this.placeholder.bottom(target);
                    }
                } else {
                    // we are sorting grids ordering, placeholder goes above/below
                    method = (location.y === 'above' ? 'before' : 'after');
                    this.placeholder[method](target);
                }

                break;
            case 'block':
                method = (location.y === 'above' ? 'top' : 'bottom');
                position = (location.x === 'other') ? method : location.x;
                this.placeholder[position](target);

                break;
        }

        // If it's not a block we don't want a small version of the placeholder
        this.placeholder.removeClass('in-between').removeClass('in-between-grids').removeClass('in-between-grids-first').removeClass('in-between-grids-last');
        this.placeholder.style({ display: 'block' })[dataType !== 'block' ? 'removeClass' : 'addClass']('in-between');

        if (originalType === 'grid' && dataType === 'grid') {
            var next     = this.placeholder.nextSibling(),
                previous = this.placeholder.previousSibling();

            this.placeholder.addClass('in-between-grids');
            if (previous && !previous.data('lm-blocktype')) { this.placeholder.addClass('in-between-grids-first'); }
            if (!next || !next.data('lm-blocktype')) { this.placeholder.addClass('in-between-grids-last'); }
        }
    },

    nolocation: function(event) {
        (!this.block.isNew() ? this.original : this.element).style({ transform: 'translate(0, 0)' });
        if (this.placeholder) { this.placeholder.remove(); }
        if (!this.block) { return; }

        var target = event.type.match(/^touch/i) ? document.elementFromPoint(event.touches.item(0).clientX, event.touches.item(0).clientY) : event.target;

        if (!this.block.isNew()) {
            target = dom(target);
            var targetNode = target[0];
            if (targetNode === this.eraser.element || this.eraser.element.contains(targetNode)) {
                this.dragdrop.removeElement = true;
                this.eraser.over();
            } else {
                this.dragdrop.removeElement = false;
                this.eraser.out();
            }
        }
    },

    resize: function(event, element, siblings, offset) {
        this.resizer.start(event, element, siblings, offset);
    },

    removeElement: function(event, element) {
        this.dragdrop.removeElement = false;

        var transition = {
            opacity: 0
        };

        element.animate(transition, {
            duration: '150ms'
        });

        var root = dom('[data-lm-root]'), blocks;
        if (this.block.getType() === 'grid' && (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])'))) {
            blocks.style({ 'pointer-events': 'inherit' });
        }

        var siblings = this.block.block.siblings(':not(.original-placeholder)');

        if (siblings && this.block.getType() == 'block') {
            var size                  = this.block.getSize(),
                diff                  = size / siblings.length,
                newSize, block, total = 0, last;
            siblings.forEach(function(sibling, index) {
                sibling = dom(sibling);
                block = get(this.builder.map, sibling.data('lm-id'));
                if (index + 1 == siblings.length) { last = block; }
                newSize = precision(block.getSize() + diff, 0);
                total += newSize;
                block.setSize(newSize, true);
            }, this);

            // ensuring it's always 100%
            if (total != 100 && last) {
                size = last.getSize();
                diff = 100 - total;
                last.setSize(size + diff, true);
            }
        }

        this.eraser.hide();

        this.dragdrop.detachDragEvents();

        this.builder.remove(this.block.getId());

        var children = this.block.block.search('[data-lm-id]');
        if (children && children.length) {
            children.forEach(function(child) {
                this.builder.remove(dom(child).data('lm-id'));
            }, this);
        }

        this.block.block.remove();

        if (this.placeholder) { this.placeholder.remove(); }
        if (this.original) { this.original.remove(); }
        this.element = this.block = null;

        singles.disable();
        singles.cleanup(this.builder);

        this.history.push(this.builder.serialize(), this.history.get().preset);
        root.removeClass('moving');

    },

    stop: function(event, target/*, element*/) {
        // we are removing the block
        var lastOvered = dom(this.dragdrop.lastOvered);
        var trashZone = this.eraser.element.querySelector('.trash-zone');
        if (lastOvered && trashZone && trashZone.contains(lastOvered[0])) {
            this.eraser.hide();
            return;
        }

        if (this.block.getType() === 'grid') {
            var siblings = this.block.block.siblings(':not(.original-placeholder):not(.section-header):not(.g-inherit):not(:empty)');
            if (siblings) {
                siblings.search('[data-lm-id]').style({ 'pointer-events': 'inherit' });
            }
        }

        if (!this.block.isNew()) { this.eraser.hide(); }
        if (!this.dragdrop.matched) {
            if (this.placeholder) { this.placeholder.remove(); }

            return;
        }

        target = dom(target);

        var wrapper, insider,
            multiLocationResize = false,
            blockWasNew         = this.block.isNew(),
            type                = this.block.getType(),
            targetId            = target.data('lm-id'),
            targetType          = !targetId ? false : get(this.builder.map, targetId) ? get(this.builder.map, targetId).getType() : target.data('lm-blocktype'),
            placeholderParent   = this.placeholder.parent();

        if (!placeholderParent) { return; }

        var parentId   = placeholderParent.data('lm-id'),
            parentType = get(this.builder.map, parentId || '') ? get(this.builder.map, parentId).getType() : false,
            resizeCase = false;

        this.original.remove();

        // case 1: it's a new particle dropped in the LM, we need to wrap it inside a block
        if (type !== 'block' && type !== 'grid' && ((targetType === 'section' || targetType === 'grid') || (targetType === 'block' && parentType !== 'block'))) {
            wrapper = new Blocks.block({
                builder: this.builder
            }).adopt(this.block.block);

            insider = new Blocks[type]({
                id: this.block.block.data('lm-id'),
                type: type,
                subtype: this.element.data('lm-blocksubtype'),
                title: this.element.text(),
                builder: this.builder
            }).setLayout(this.block.block);

            wrapper.setSize();

            this.block = wrapper;
            this.builder.add(wrapper);
            this.builder.add(insider);

            insider.emit('rendered', insider, wrapper);
            wrapper.emit('rendered', wrapper, null);

            resizeCase = { case: 1 };
        }

        // case 2: moving a block around, need to fix sizes if it's a multi location resize
        if (this.originalType === 'block' && this.block.getType() === 'block') {
            resizeCase = { case: 3 };
            var previous            = this.block.block.parent('[data-lm-blocktype="grid"]'),
                placeholderPrevious = this.placeholder.parent('[data-lm-blocktype="grid"]');
            //if (previous.find('!> [data-lm-blocktype="container"]')) { previous = previous.parent(); }
            //if (placeholderPrevious.find('!> [data-lm-blocktype="container"]')) { placeholderPrevious = placeholderPrevious.parent(); }
            if (placeholderPrevious !== previous) {
                multiLocationResize = {
                    from: this.block.block.siblings(':not(.placeholder)'),
                    to: this.placeholder.siblings(':not(.placeholder)')
                };
            }

            if (previous.parent('[data-lm-blocktype="container"]')) { previous = previous.parent(); }
            previous = previous.siblings(':not(.original-placeholder)');
            if (!this.block.isNew() && previous.length) { this.resizer.evenResize(previous); }

            this.block.block.attribute('style', null);
            this.block.setSize();
        }

        if (type === 'grid' && !siblings) {
            var plus = this.block.block.parent('[data-lm-blocktype="section"]').find('.fa-plus');
            if (plus) { plus.emit('click'); }
        }

        if (this.block.hasAttribute('size') && typeof this.block.getSize === 'function') { this.block.setSize(this.placeholder.compute('flex')); }

        this.block.insert(this.placeholder);
        this.placeholder.remove();

        if (blockWasNew) {
            if (resizeCase) { this.resizer.evenResize(dom([this.block.block, this.block.block.siblings()])); }

            this.element.attribute('style', null);
        }


        if (multiLocationResize.from || (multiLocationResize.to && multiLocationResize.to != this.block.block)) {
            // if !from / !to means it's empty grid, should we remove it?
            var size = this.block.getSize(), diff, block;

            // we are moving the particle to an empty grid, resetting the size to 100%
            if (!multiLocationResize.to) { this.block.setSize(100, true); }

            // we need to compensate the remaining blocks on the FROM with the leaving particle size
            if (multiLocationResize.from) {
                diff = size / multiLocationResize.from.length;
                var total = 0, curSize;
                multiLocationResize.from.forEach(function(sibling) {
                    sibling = dom(sibling);
                    block = get(this.builder.map, sibling.data('lm-id'));
                    curSize = block.getSize() + diff;
                    block.setSize(curSize, true);
                    total += curSize;
                }, this);

                if (total !== 100) {
                    diff = (100 - total) / multiLocationResize.from.length;
                    multiLocationResize.from.forEach(function(sibling) {
                        sibling = dom(sibling);
                        block = get(this.builder.map, sibling.data('lm-id'));
                        curSize = block.getSize() + diff;
                        block.setSize(curSize, true);
                    }, this);
                }
            }

            // the TO is receiving a new block so we are going to evenize
            if (multiLocationResize.to) {
                size = 100 / (multiLocationResize.to.length + 1);
                multiLocationResize.to.forEach(function(sibling) {
                    sibling = dom(sibling);
                    block = get(this.builder.map, sibling.data('lm-id'));
                    block.setSize(size, true);
                }, this);
                this.block.setSize(size, true);
            }
        }

        singles.disable();
        singles.cleanup(this.builder);
        this.builder.normalizeGridSizes();

        this.history.push(this.builder.serialize(), this.history.get().preset);
    },

    stopAnimation: function(element) {
        var root = dom('[data-lm-root]');
        root.removeClass('moving');

        if (this.original) { this.original.remove(); }
        singles.disable();

        if (!this.block) { this.block = get(this.builder.map, element.data('lm-id')); }
        if (this.block && this.block.getType() === 'block') { this.block.setSize(); }
        if (this.block && this.block.isNew() && this.element) { this.element.attribute('style', null); }

        if (this.originalType === 'grid') {
            var blocks, block;
            if (blocks = root.search('[data-lm-dropzone]:not([data-lm-blocktype="grid"])')) {
                blocks.forEach(function(element) {
                    element = dom(element);
                    block = get(this.builder.map, element.data('lm-id'));
                    element.attribute('style', null);
                    block.setSize();
                }, this);
            }
        }
    }
};

class LayoutManager extends EventEmitter {
    constructor(element, options) {
        super();
        this._boundMethods = Object.create(null);
        LayoutManagerDefinition.initialize.call(this, element, options);
    }

    setOptions(options) {
        this.options = Object.assign({}, LayoutManagerDefinition.options, options || {});
        return this;
    }

    bound(method) {
        return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    }
}

Object.keys(LayoutManagerDefinition).forEach(function(method) {
    if (method !== 'options' && method !== 'initialize') {
        LayoutManager.prototype[method] = LayoutManagerDefinition[method];
    }
});
LayoutManager.prototype.options = LayoutManagerDefinition.options;

module.exports = LayoutManager;
