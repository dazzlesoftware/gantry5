"use strict";

var $            = require('elements'),
    EventEmitter = require('../utils/event-emitter'),
    Blocks       = require('./blocks/'),
    ID           = require('./id');

require('elements/attributes');
require('elements/traversal');

var DEBUG = false;

var collectionSize = function(value) {
    if (!value) { return 0; }
    return Array.isArray(value) ? value.length : Object.keys(value).length;
};

var forEachCollection = function(collection, callback, context) {
    if (!collection) { return; }
    if (Array.isArray(collection) || typeof collection.length === 'number') {
        Array.prototype.forEach.call(collection, callback, context);
        return;
    }
    Object.keys(collection).forEach(function(key) {
        callback.call(context, collection[key], key, collection);
    });
};

var fillMissing = function(target, source) {
    Object.keys(source || {}).forEach(function(key) {
        var sourceValue = source[key],
            targetValue = target[key];

        if (typeof targetValue === 'undefined') {
            target[key] = sourceValue;
        } else if (targetValue && sourceValue && typeof targetValue === 'object' && typeof sourceValue === 'object' && !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
            fillMissing(targetValue, sourceValue);
        }
    });
    return target;
};

var withoutChildren = function(value) {
    var output = {};
    Object.keys(value || {}).forEach(function(key) {
        if (key !== 'children') { output[key] = value[key]; }
    });
    return output;
};

$.implement({
    empty: function() {
        return this.forEach(function(node) {
            while (node.firstChild) { node.removeChild(node.firstChild); }
        });
    }
});

class Builder extends EventEmitter {
    constructor(structure) {
        super();
        if (structure) { this.setStructure(structure); }
        this.map = {};
    }

    setStructure(structure) {
        try {
            this.structure = typeof structure === 'object' ? structure : JSON.parse(structure);
        } catch (error) {
            console.error('Parsing error:', error);
        }
    }

    add(block) {
        var id = typeof block === 'string' ? block : block.id;
        this.map[id] = block;
        block.isNew(false);
    }

    remove(block) {
        var id = typeof block === 'string' ? block : block.id;
        delete this.map[id];
    }

    get(block) {
        var id = typeof block === 'string' ? block : block.id;
        return Object.prototype.hasOwnProperty.call(this.map, id) ? this.map[id] : block;
    }

    load(data) {
        this.recursiveLoad(data);
        this.emit('loaded', data);
        return this;
    }

    serialize(root, flat) {
        var serializedChildren = [];
        root = root || $('[data-lm-root]');
        if (!root) { return; }

        var blocks = root.search((!flat ? '> ' : '') + '[data-lm-id]');
        forEachCollection(blocks, function(node) {
            var element = $(node),
                id = element.data('lm-id'),
                type = element.data('lm-blocktype'),
                subtype = element.data('lm-blocksubtype') || false,
                hasChildren = element.search('> [data-lm-id]'),
                mapped = this.map[id],
                children;

            if (flat) {
                children = hasChildren ? hasChildren.map(function(child) { return $(child).data('lm-id'); }) : false;
            } else {
                children = hasChildren ? this.serialize(element) : [];
            }

            var serial = {
                id: id,
                type: type,
                subtype: subtype,
                title: mapped ? mapped.getTitle() : 'Untitled',
                attributes: mapped ? mapped.getAttributes() : {},
                inherit: mapped ? mapped.getInheritance() : {},
                children: children
            };

            if (flat) {
                var keyed = {};
                keyed[id] = serial;
                serial = keyed;
            }
            serializedChildren.push(serial);
        }, this);

        return serializedChildren;
    }

    insert(key, value, parent) {
        var root = $('[data-lm-root]');
        if (!root) { return; }
        if (!Blocks[value.type]) { console.error(value.type + ' does not exist'); }

        var settings = fillMissing({
                id: key,
                attributes: {},
                inherit: {},
                subtype: value.subtype || false,
                builder: this
            }, withoutChildren(value)),
            Element = new (Blocks[value.type] || Blocks.section)(settings);

        if (!parent) { Element.block.insert(root); }
        else { Element.block.insert($('[data-lm-id="' + parent + '"]')); }

        if (Element.getType() === 'block') { Element.setSize(); }
        this.add(Element);
        Element.emit('rendered', Element, parent ? this.map[parent] : null);
        return Element;
    }

    reset(data) {
        this.map = {};
        this.setStructure(data || {});
        $('[data-lm-root]').empty();
        this.load();
    }

    cleanupLonely() {
        var ghosts = [],
            parent,
            children = $('[data-lm-root] > .g-section > .g-grid > .g-block .g-grid > .g-block, [data-lm-root] > .g-section > .g-grid > .g-block > .g-block');

        if (!children) { return; }
        children.forEach(function(child) {
            child = $(child);
            parent = null;
            var isGrid = child.parent().hasClass('g-grid');
            if (isGrid && child.siblings()) { return false; }
            if (isGrid) {
                ghosts.push(child.data('lm-id'));
                parent = child.parent();
            }
            ghosts.push(child.data('lm-id'));
            child.children().before(parent || child);
            (parent || child).remove();
        });
        return ghosts;
    }

    recursiveLoad(data, callback, depth, parent) {
        data = data || this.structure;
        depth = depth || 0;
        parent = parent || false;
        callback = callback || this.insert;

        forEachCollection(data, function(value) {
            if (!value.id) {
                value.id = ID({ builder: { map: this.map }, type: value.type, subtype: value.subtype });
            }

            if (DEBUG) {
                console.log((('    '.repeat(depth)) + value.type).padEnd(35) + ' (' + String(value.id).padEnd(36) + ') parent: ' + parent);
            }

            this.emit('loading', callback.call(this, value.id, value, parent, depth));
            if (value.children && collectionSize(value.children)) {
                depth++;
                forEachCollection(value.children, function(childValue) {
                    this.recursiveLoad([childValue], callback, depth, value.id);
                }, this);
            }

            this.get(value.id).emit('done', this.get(value.id));
            depth--;
        }, this);
    }
}

module.exports = Builder;
