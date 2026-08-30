import __module0 from '../utils/event-emitter.js';
import __module1 from './blocks/index.js';
import __module2 from './id.js';
import __module3 from './normalize-grid-columns.js';

"use strict";

let EventEmitter = __module0,
    Blocks       = __module1,
    ID           = __module2,
    normalizeGridColumns = __module3;

let DEBUG = false;

let collectionSize = function(value) {
    if (!value) { return 0; }
    return Array.isArray(value) ? value.length : Object.keys(value).length;
};

let forEachCollection = function(collection, callback, context) {
    if (!collection) { return; }
    if (Array.isArray(collection) || typeof collection.length === 'number') {
        Array.prototype.forEach.call(collection, callback, context);
        return;
    }
    Object.keys(collection).forEach(function(key) {
        callback.call(context, collection[key], key, collection);
    });
};

let fillMissing = function(target, source) {
    Object.keys(source || {}).forEach(function(key) {
        let sourceValue = source[key],
            targetValue = target[key];

        if (typeof targetValue === 'undefined') {
            target[key] = sourceValue;
        } else if (targetValue && sourceValue && typeof targetValue === 'object' && typeof sourceValue === 'object' && !Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
            fillMissing(targetValue, sourceValue);
        }
    });
    return target;
};

let withoutChildren = function(value) {
    let output = {};
    Object.keys(value || {}).forEach(function(key) {
        if (key !== 'children') { output[key] = value[key]; }
    });
    return output;
};

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
        let id = typeof block === 'string' ? block : block.id;
        this.map[id] = block;
        if (block && typeof block.isNew === 'function') { block.isNew(false); }
    }

    remove(block) {
        let id = typeof block === 'string' ? block : block.id;
        delete this.map[id];
    }

    clearChildren(root) {
        root = root ? (root.nodeType ? root : root[0]) : null;
        if (!root) { return this; }

        // Remove the deepest objects first so no stale rows/grids remain in
        // the map when a cloned section is replaced by inherited children.
        Array.from(root.querySelectorAll('[data-lm-id]')).reverse().forEach(function(element) {
            this.remove(element.getAttribute('data-lm-id'));
        }, this);

        Array.from(root.children).forEach(function(element) {
            if (element.hasAttribute('data-lm-id')) { element.remove(); }
        });

        return this;
    }

    get(block) {
        let id = typeof block === 'string' ? block : block.id;
        return Object.prototype.hasOwnProperty.call(this.map, id) ? this.map[id] : block;
    }

    load(data) {
        this.recursiveLoad(data);
        this.normalizeGridColumns();
        this.emit('loaded', data);
        return this;
    }

    normalizeGridColumns(root, fixedBlock) {
        root = root || document.querySelector('[data-lm-root]');
        normalizeGridColumns(root, this.get.bind(this), fixedBlock);
        return this;
    }

    serialize(root, flat) {
        let serializedChildren = [];
        root = root ? (root.nodeType ? root : root[0]) : document.querySelector('[data-lm-root]');
        if (!root) { return; }

        let blocks = flat
            ? root.querySelectorAll('[data-lm-id]')
            : Array.from(root.children).filter(function(child) { return child.hasAttribute('data-lm-id'); });
        forEachCollection(blocks, function(node) {
            let id = node.getAttribute('data-lm-id'),
                type = node.getAttribute('data-lm-blocktype'),
                subtype = node.getAttribute('data-lm-blocksubtype') || false,
                hasChildren = Array.from(node.children).filter(function(child) { return child.hasAttribute('data-lm-id'); }),
                mapped = this.map[id],
                children;

            if (flat) {
                children = hasChildren.length ? hasChildren.map(function(child) { return child.getAttribute('data-lm-id'); }) : false;
            } else {
                children = hasChildren.length ? this.serialize(node) : [];
            }

            let serial = {
                id: id,
                type: type,
                subtype: subtype,
                title: mapped ? mapped.getTitle() : 'Untitled',
                attributes: mapped ? mapped.getAttributes() : {},
                inherit: mapped ? mapped.getInheritance() : {},
                children: children
            };

            if (flat) {
                let keyed = {};
                keyed[id] = serial;
                serial = keyed;
            }
            serializedChildren.push(serial);
        }, this);

        return serializedChildren;
    }

    insert(key, value, parent) {
        let root = document.querySelector('[data-lm-root]');
        if (!root) { return; }
        if (!Blocks[value.type]) { console.error(value.type + ' does not exist'); }

        let settings = fillMissing({
                id: key,
                attributes: {},
                inherit: {},
                subtype: value.subtype || false,
                builder: this
            }, withoutChildren(value)),
            Element = new (Blocks[value.type] || Blocks.section)(settings);

        let block = Element.block[0],
            target = parent ? document.querySelector('[data-lm-id="' + CSS.escape(parent) + '"]') : root;
        if (target) { target.appendChild(block); }

        if (Element.getType() === 'block') { Element.setColumnSpan(); }
        this.add(Element);
        Element.emit('rendered', Element, parent ? this.map[parent] : null);
        return Element;
    }

    reset(data) {
        this.map = {};
        this.setStructure(data || {});
        let root = document.querySelector('[data-lm-root]');
        if (root) { root.replaceChildren(); }
        this.load();
    }

    cleanupLonely() {
        let ghosts = [],
            parent,
            children = document.querySelectorAll('[data-lm-root] > .g-section > .row > .col .row > .col, [data-lm-root] > .g-section > .row > .col > .col');

        if (!children.length) { return; }
        children.forEach(function(child) {
            parent = null;
            let childParent = child.parentElement,
                isGrid = childParent && childParent.classList.contains('row');
            if (isGrid && childParent.children.length > 1) { return; }
            if (isGrid) {
                let gridId = childParent.getAttribute('data-lm-id');
                if (gridId) { ghosts.push(gridId); }
                parent = childParent;
            }
            let childId = child.getAttribute('data-lm-id');
            if (childId) { ghosts.push(childId); }

            let removalTarget = parent || child;
            Array.from(child.children).forEach(function(grandchild) {
                removalTarget.parentNode.insertBefore(grandchild, removalTarget);
            });
            removalTarget.remove();
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

export default Builder;
