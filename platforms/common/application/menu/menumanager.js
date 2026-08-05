import __module0 from '../utils/event-emitter.js';
import __module1 from '../utils/dom-effects.js';
import __module2 from '../utils/create-element.js';
import __module3 from '../ui/drag.drop.js';
import __module4 from '../ui/eraser.js';
import __module5 from './drag.resizer.js';

"use strict";
var EventEmitter = __module0,
    dom         = __module1,
    zen       = __module2,
    DragDrop  = __module3,
    Eraser    = __module4,
    Resizer   = __module5;

var ltrim = function(value) {
        return String(value == null ? '' : value).replace(/^\/+/, '');
    },
    last = function(collection) {
        return collection && collection.length ? collection[collection.length - 1] : undefined;
    },
    indexOf = function(collection, value) {
        return Array.prototype.indexOf.call(collection || [], value);
    },
    isPlainObject = function(value) {
        if (!value || Object.prototype.toString.call(value) !== '[object Object]') { return false; }
        var prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    },
    cloneValue = function(value, seen) {
        if (!value || typeof value !== 'object') { return value; }
        if (value instanceof Date) { return new Date(value.getTime()); }
        if (value instanceof RegExp) { return new RegExp(value.source, value.flags); }
        if (!Array.isArray(value) && !isPlainObject(value)) { return value; }
        if (seen.has(value)) { return seen.get(value); }

        var clone = Array.isArray(value) ? [] : {};
        seen.set(value, clone);
        Object.keys(value).forEach(function(key) {
            clone[key] = cloneValue(value[key], seen);
        });
        return clone;
    },
    deepClone = function(value) {
        return cloneValue(value, new WeakMap());
    };


var MenuManagerDefinition = {
    options: {},

    initialize: function(element, options) {
        this.setOptions(options);
        this.refElement = element;
        this.map = {};

        if (!element || !dom(element)) { return; }

        this.init(element);
    },

    init: function() {
        if (this.dragdrop) { this.dragdrop.detach(); }
        this.setRoot();

        this.dragdrop = new DragDrop(this.refElement, this.options, this);
        this.resizer = new Resizer(this.refElement, this.options, this);
        this.eraser = new Eraser('[data-mm-eraseparticle]', this.options);
        this.dragdrop
            .on('dragdrop:click', this.bound('click'))
            .on('dragdrop:start', this.bound('start'))
            .on('dragdrop:move:once', this.bound('moveOnce'))
            .on('dragdrop:location', this.bound('location'))
            .on('dragdrop:nolocation', this.bound('nolocation'))
            .on('dragdrop:resize', this.bound('resize'))
            .on('dragdrop:stop:erase', this.bound('removeElement'))
            .on('dragdrop:stop', this.bound('stop'))
            .on('dragdrop:stop:animation', this.bound('stopAnimation'));
    },

    refresh: function() {
        if (!this.refElement || !dom(this.refElement)) { return; }
        this.init();
    },

    setRoot: function() {
        this.root = dom('#menu-editor');

        if (this.root) {
            this.settings = JSON.parse(this.root.data('menu-settings'));
            this.ordering = JSON.parse(this.root.data('menu-ordering'));
            this.items = JSON.parse(this.root.data('menu-items'));

            this.map = {
                settings: deepClone(this.settings),
                ordering: deepClone(this.ordering),
                items: deepClone(this.items)
            };

            var submenus = dom('[data-genesis-menu-columns] .submenu-selector'), columns;
            if (this.resizer && submenus && (columns = submenus.search('> [data-mm-id]'))) { this.resizer.updateMaxValues(columns); }
        }
    },

    click: function(event, element) {
        var target = dom(event.target);
        if (target.matches('.g-menu-addblock') || target.parent('.g-menu-addblock')) {
            return false;
        }

        if (element.hasClass('g-block')) {
            this.stopAnimation();
            return true;
        }

        if (element.find('[data-genesis-ajaxify]')) {
            var siblings = element.siblings();
            element.addClass('active');
            if (siblings) { siblings.removeClass('active'); }
        }

        element.emit('click');

        var link = element.find('a');
        if (link) { link[0].click(); }
    },

    resize: function(event, element, siblings, offset) {
        this.resizer.start(event, element, siblings, offset);
    },

    start: function(event, element) {
        var root = element.parent('.menu-selector') || element.parent('.submenu-column') || element.parent('.submenu-selector') || element.parent('.genesis-mm-particles-picker'),
            size = dom(element).position(),
            coords = dom(element)[0].getBoundingClientRect();

        this.block = null;
        this.targetLevel = undefined;
        this.addNewItem = false;
        this.type =  element.parent('.g-toplevel') || element.matches('.g-toplevel') ? 'main' : (element.matches('.g-block') ? 'column' : 'columns_items');
        this.isParticle = element.matches('[data-mm-blocktype]') || element.matches('[data-mm-original-type]');
        this.wasActive = element.hasClass('active');
        this.isNewParticle = element.parent('.genesis-mm-particles-picker');
        this.ParticleIndex = -1;
        this.root = root;
        this.Element = element;

        this.itemID = element.data('mm-id');
        this.itemLevel = element.data('mm-level');
        this.itemFrom = element.parent('[data-mm-id]');
        this.itemTo = null;

        if (this.isParticle && !this.isNewParticle) {
            var children = element.parent().children('[data-mm-id]');
            this.ParticleIndex = indexOf(children, element[0]);
        }

        root.addClass('moving');

        var type = dom(element).data('mm-id'),
            clone = element[0].cloneNode(true);

        if (!this.placeholder) { this.placeholder = zen((this.type == 'column' ? 'div' : 'li') + '.block.placeholder[data-mm-placeholder]'); }
        this.placeholder.style({ display: 'none' });
        this.original = dom(clone).after(element).style({
            display: 'inline-block',
            opacity: 1
        }).addClass('original-placeholder').data('lm-dropzone', null);
        this.originalType = type;
        this.block = element;

        if (!this.isNewParticle) {
            element.style({
                position: 'fixed',
                zIndex: 1500,
                width: Math.ceil(size.width),
                height: Math.ceil(size.height),
                left: coords.left,
                top: coords.top
            }).addClass('active');

            this.placeholder.before(element);
        } else {
            var position = element.position();
            this.original.style({
                position: 'fixed',
                opacity: 0.5
            }).style({
                left: coords.left,
                top: coords.top,
                width: position.width,
                height: position.height
            });
            this.element = this.dragdrop.element;
            this.block = this.dragdrop.element;
            this.dragdrop.element = this.original;
        }

        if (this.type == 'column') {
            root.search('.g-block > *').style({ 'pointer-events': 'none' });
        }
    },

    moveOnce: function(element) {
        element = dom(element);
        if (this.original) { this.original.style({ opacity: 0.5 }); }

        // it's a module or a particle and we allow for them to be deleted
        if (!this.isNewParticle && (element.hasClass('g-menu-removable') || this.isParticle)) {
            this.eraser.show();
        }
    },

    location: function(event, location, target/*, element*/) {
        target = dom(target);
        (!this.isNewParticle ? this.original : this.block).style({transform: 'translate(0, 0)'});
        if (!this.placeholder) { this.placeholder = zen((this.type == 'column' ? 'div' : 'li') + '.block.placeholder[data-mm-placeholder]').style({ display: 'none' }); }

        var targetType = target.parent('.g-toplevel') || target.matches('.g-toplevel') ? 'main' : (target.matches('.g-block') ? 'column' : 'columns_items'),
            dataLevel = target.data('mm-level'),
            originalLevel = this.block.data('mm-level');

        if (this.isParticle && (targetType === 'main' && !dataLevel)) {
            this.dragdrop.matched = false;
            return;
        }

        // Support for nested new particles/modules/widgets
        if (dataLevel === null && this.type === 'columns_items' && this.isParticle && this.isNewParticle) {
            var submenu_items = target.find('.submenu-items');
            if (!submenu_items) {
                this.dragdrop.matched = false;
                return;
            }

            this.placeholder.style({ display: 'block' }).bottom(submenu_items);
            this.addNewItem = submenu_items;
            this.targetLevel = 2;
            this.dragdrop.matched = false;
            return;
        }

        // Workaround for layout and style of columns
        if (dataLevel === null && (this.type === 'columns_items' || this.isParticle)) {
            var submenu_items = target.find('.submenu-items'),
                submenu_items_level = submenu_items.data('mm-base-level');

            // extend drop areas and ensure items cannot be dragged between different levels
            if ((!target.hasClass('g-block') || target.find(this.block)) || (!this.isParticle && originalLevel != submenu_items_level) && (!submenu_items || submenu_items.children() || originalLevel > 2)) {
                this.dragdrop.matched = false;
                return;
            }

            this.placeholder.style({ display: 'block' }).bottom(submenu_items);
            this.addNewItem = submenu_items;
            this.targetLevel = 2;
            this.dragdrop.matched = false;
            return;
        }


        if (!this.isParticle) {

            // We only allow sorting between same level items
            if (this.type !== 'column' && originalLevel !== dataLevel) {
                this.dragdrop.matched = false;
                return;
            }

            // Ensuring columns can only be dragged before/after other columns
            if (this.type == 'column' && dataLevel) {
                this.dragdrop.matched = false;
                return;
            }

            // For levels > 2 we only allow sorting within the same column
            if (dataLevel > 2 && target.parent('ul') != this.block.parent('ul')) {
                this.dragdrop.matched = false;
                return;
            }
        }

        // Check for adjacents and avoid inserting any placeholder since it would be the same position
        var exclude = ':not(.placeholder):not([data-mm-id="' + this.original.data('mm-id') + '"])',
            adjacents = {
                before: this.original.previousSiblings(exclude),
                after: this.original.nextSiblings(exclude)
            };

        if (adjacents.before) { adjacents.before = dom(adjacents.before[0]); }
        if (adjacents.after) { adjacents.after = dom(adjacents.after[0]); }


        if (targetType === 'main' && ((adjacents.before === target && location.x === 'after') || (adjacents.after === target && location.x === 'before'))) {
            return;
        }
        if (targetType === 'column' && ((adjacents.before === target && location.x === 'after') || (adjacents.after === target && location.x === 'before'))) {
            return;
        }
        if (targetType === 'columns_items' && ((adjacents.before === target && location.y === 'below') || (adjacents.after === target && location.y === 'above'))) {
            return;
        }

        // Handles the types cases and normalizes the locations (x and y)
        switch (targetType) {
            case 'main':
            case 'column':
                this.placeholder[location.x](target);
                break;
            case 'columns_items':
                this.placeholder[location.y === 'above' ? 'before' : 'after'](target);

                break;
        }

        this.targetLevel = dataLevel;

        // If it's not a block we don't want a small version of the placeholder
        this.placeholder.style({ display: 'block' })[targetType !== 'main' ? 'removeClass' : 'addClass']('in-between');

    },

    nolocation: function(event) {
        (!this.isNewParticle ? this.original : this.block).style({transform: 'translate(0, 0)'});
        if (this.placeholder) { this.placeholder.remove(); }
        this.targetLevel = undefined;

        var target = event.type.match(/^touch/i) ? document.elementFromPoint(event.touches.item(0).clientX, event.touches.item(0).clientY) : event.target;

        if (!this.isNewParticle && (this.Element.hasClass('g-menu-removable') || this.isParticle)) {
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

    removeElement: function(event, element) {
        this.dragdrop.removeElement = false;

        var transition = {
            opacity: 0
        };

        element.animate(transition, {
            duration: '150ms'
        });

        if (this.type == 'column') {
            this.root.search('.g-block > *').style({ 'pointer-events': 'none' });
        }

        this.eraser.hide();

        this.dragdrop.detachDragEvents();

        var particle = this.block,
            base = particle.parent('[data-mm-base]').data('mm-base'),
            col = (particle.parent('[data-mm-id]').data('mm-id').match(/\d+$/) || [0])[0],
            index = indexOf(particle.parent().children('[data-mm-id]:not(.original-placeholder)'), particle[0]);

        delete this.items[this.itemID];
        this.ordering[base][col].splice(index, 1);

        this.block.remove();
        this.original.remove();
        this.root.removeClass('moving');

        if (this.root.find('.submenu-items')) {
            if (!this.root.find('.submenu-items').children()) { this.root.find('.submenu-items').text(''); }
        }

        this.emit('dragEnd', this.map, 'reorder');
    },

    stop: function(event, target, element) {
        target = dom(target);

        // we are removing the block
        var lastOvered = dom(this.dragdrop.lastOvered);
        var trashZone = this.eraser.element.querySelector('.trash-zone');
        if (lastOvered && trashZone && trashZone.contains(lastOvered[0])) {
            this.eraser.hide();
            return;
        }

        if (target) { element.removeClass('active'); }
        if (this.type == 'column') {
            this.root.search('.g-block > *').attribute('style', null);
        }

        if (!this.dragdrop.matched && !this.addNewItem) {
            if (this.placeholder) { this.placeholder.remove(); }

            this.type = undefined;
            this.targetLevel = false;
            this.isParticle = undefined;
            this.eraser.hide();
            return;
        }

        var placeholderParent = this.placeholder.parent();
        if (!placeholderParent) {
            this.type = undefined;
            this.targetLevel = false;
            this.isParticle = undefined;
            return;
        }

        if (this.addNewItem) { this.block.attribute('style', null).removeClass('active'); }

        var parent = this.block.parent();
        this.eraser.hide();

        if (this.original) {
            if (!this.isNewParticle) { this.original.remove(); }
            else { this.original.attribute('style', null).removeClass('original-placeholder'); }
        }


        this.block.after(this.placeholder);
        this.placeholder.remove();
        this.itemTo = this.block.parent('[data-mm-id]');
        this.currentLevel = this.itemLevel;
        if (this.wasActive) { element.addClass('active'); }

        if (this.isParticle) {
            var id = last(this.itemID.split('/')),
                targetItem = (target || this.itemTo),
                base = targetItem[target && !target.hasClass('g-block') ? 'parent' : 'find']('[data-mm-base]').data('mm-base');

            this.itemID = base ? base + '/' + id : id;
            this.itemLevel = this.targetLevel;
            this.block.data('mm-id', this.itemID).data('mm-level', this.targetLevel);
        }

        var path = this.itemID.split('/'),
            items, column;

        path.splice(this.itemLevel - 1);
        path = path.join('/');

        // Items reorder for root or sublevels with logic to reorder FROM and TO sublevel column if needed
        if (this.itemFrom || this.itemTo) {
            var sources = this.itemFrom == this.itemTo ? [this.itemFrom] : [this.itemFrom, this.itemTo];
            sources.forEach(function(source) {
                if (!source) { return; }

                items = source.search('[data-mm-id]');
                column = Number(this.block.data('mm-level') > 2 ? 0 : (source.data('mm-id').match(/\d+$/) || [0])[0]);

                if (!items) {
                    this.ordering[path][column] = [];
                    return;
                }

                items = items.map(function(element) {
                    return dom(element).data('mm-id');
                });

                if (!this.ordering[path]) { this.ordering[path] = []; }
                this.ordering[path][column] = items;
            }, this);

            // Refresh the origin if it's a particle
            base = this.itemFrom ? (this.itemFrom.attribute('data-mm-base') !== null ? this.itemFrom : this.itemFrom.find('[data-mm-base]')) : null;
            if (this.isParticle && base && this.targetLevel != this.currentLevel) {
                var list = (this.itemFrom.data('mm-id').match(/\d+$/) || [0])[0],
                    location = base.data('mm-base') || '',
                    currentLocation = ltrim([location, id].join('/'), ['/']);

                this.ordering[location][list].splice(this.ParticleIndex, 1);
                this.items[this.itemID] = this.items[currentLocation];
                delete this.items[currentLocation];
            }
        }

        // Column reordering, we just need to swap the array indexes
        if (!this.itemFrom && !this.itemTo && !this.isParticle) {
            var colsOrder = [],
                active = dom('.g-toplevel [data-mm-id].active').data('mm-id');
            items = parent.search('> [data-mm-id]');

            items.forEach(function(element, index) {
                element = dom(element);

                var id = element.data('mm-id'),
                    column = Number((id.match(/\d+$/) || [0])[0]);

                element.data('mm-id', id.replace(/\d+$/, '' + index));
                colsOrder.push(this.ordering[active][column]);
            }, this);

            this.ordering[active] = colsOrder;
        }

        /*if (console && console.group && console.info && console.table && console.groupEnd) {
         console.group();
         console.info('New Ordering');
         console.table(this.ordering);
         console.groupEnd();
         }*/

        var selector = this.block.parent('.submenu-selector');
        if (selector) { this.resizer.updateItemSizes(selector.search('> [data-mm-id]')); }

        this.emit('dragEnd', this.map, 'reorder');
    },

    stopAnimation: function(/*element*/) {
        var flex = null;
        if (this.type == 'column') { flex = this.resizer.getSize(this.block); }
        if (this.root) { this.root.removeClass('moving'); }
        if (this.block) {
            this.block.attribute('style', null);
            if (flex) { this.block.style('flex', '0 1 ' + flex + ' %'); }
        }

        if (this.original) {
            if (!this.isNewParticle || (!this.dragdrop.matched && !this.targetLevel)) { this.original.remove(); }
            else { this.original.attribute('style', null).removeClass('original-placeholder'); }
        }

        if (!this.wasActive && this.block) { this.block.removeClass('active'); }
    }
};

class MenuManager extends EventEmitter {
    constructor(element, options) {
        super();
        this._boundMethods = Object.create(null);
        MenuManagerDefinition.initialize.call(this, element, options);
    }

    setOptions(options) {
        this.options = Object.assign({}, MenuManagerDefinition.options, options || {});
        return this;
    }

    bound(method) {
        return this._boundMethods[method] || (this._boundMethods[method] = this[method].bind(this));
    }
}

Object.keys(MenuManagerDefinition).forEach(function(method) {
    if (method !== 'options' && method !== 'initialize') {
        MenuManager.prototype[method] = MenuManagerDefinition[method];
    }
});
MenuManager.prototype.options = MenuManagerDefinition.options;


export default MenuManager;
