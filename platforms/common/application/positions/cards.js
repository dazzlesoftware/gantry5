import __module0 from '../utils/dom.js';
import __module1 from '../ui/eraser.js';
import __module2 from '../utils/draggable-group.js';
import __module3 from '../utils/flags-state.js';

"use strict";

const { ready, delegate } = __module0;
const Eraser = __module1;
const DraggableGroup = __module2;
const flags = __module3;

const elementsFrom = value => {
    if (!value) return [];
    if (value instanceof Element) return [value];
    return Array.from(value).map(item => item instanceof Element ? item : item && item[0]).filter(Boolean);
};

const updateSaveIndicator = changed => {
    const save = document.querySelector('[data-save="Positions"]');
    if (!save) return;

    const indicator = save.querySelector('.changes-indicator');
    if (!changed && indicator) indicator.remove();
    if (changed && !indicator) {
        const icon = document.createElement('i');
        icon.className = 'changes-indicator far fa-fw fa-circle';
        save.prepend(icon);
    }
};

const Positions = {
    eraser: null,
    lists: [],
    state: [],

    init(position) {
        Positions.state = Positions.serialize(position);
        return Positions.state;
    },

    equals() {
        return Positions.state === Positions.serialize();
    },

    updatePendingChanges() {
        const equal = Positions.equals();
        updateSaveIndicator(!equal);
        flags.set('pending', !equal);
    },

    serialize(position) {
        const output = [];
        const positions = position ? elementsFrom(position) : Array.from(document.querySelectorAll('[data-genesis-position]'));
        if (!positions.length) return '[]';

        positions.forEach(positionElement => {
            const data = JSON.parse(positionElement.getAttribute('data-genesis-position'));
            data.modules = [];

            positionElement.querySelectorAll('[data-pm-data]').forEach(item => {
                data.modules.push(JSON.parse(item.getAttribute('data-pm-data') || '{}'));
            });

            output.push(data);
            positionElement.setAttribute('data-genesis-position', JSON.stringify(data));
        });

        return JSON.stringify(output).replace(/\//g, '\\/');
    },

    attachEraser() {
        const element = document.querySelector('[data-genesis-positions-erase]');
        if (Positions.eraser) {
            Positions.eraser.setElement(element);
            Positions.eraser.hide(true);
            return;
        }
        Positions.eraser = new Eraser(element);
    },

    createSortables(element) {
        Positions.attachEraser();
        const root = element || document.querySelector('#positions');
        if (!root || root.SimpleSort) return;

        const group = new DraggableGroup(root, {
            lists: '[data-genesis-position] ul',
            items: '[data-pm-data]',
            filter: '[data-genesis-position-ignore]',
            trash: '#trash',
            draggingClass: 'position-dragging',
            scrollContainer: '.position-container',

            onStart() {
                Positions.attachEraser();
                Positions.eraser.show();
            },

            onTrashOver(over) {
                if (over) Positions.eraser.over();
                else Positions.eraser.out();
            },

            onEnd() {
                Positions.eraser.hide();
                Positions.serialize();
                Positions.updatePendingChanges();
            }
        });

        Positions.lists = group.lists;
        root.SimpleSort = group;
    }
};

const attachSortablePositions = positions => {
    if (positions && !positions.SimpleSort) Positions.createSortables(positions);
};

ready(() => {
    const positions = document.querySelector('#positions');
    delegate(document.body, 'mouseover', '#positions', (event, element) => attachSortablePositions(element));
    attachSortablePositions(positions);
});

export default Positions;
