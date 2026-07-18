"use strict";

const { ready, delegate } = require('../utils/dom');
const Eraser = require('../ui/eraser');
const simpleSort = require('sortablejs');
const flags = require('../utils/flags-state');

const groupOptions = [
    { name: 'positions', pull: true, put: true },
    { name: 'positions', pull: false, put: false }
];

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
        const positions = position ? elementsFrom(position) : Array.from(document.querySelectorAll('[data-g5-position]'));
        if (!positions.length) return '[]';

        positions.forEach(positionElement => {
            const data = JSON.parse(positionElement.getAttribute('data-g5-position'));
            data.modules = [];

            positionElement.querySelectorAll('[data-pm-data]').forEach(item => {
                data.modules.push(JSON.parse(item.getAttribute('data-pm-data') || '{}'));
            });

            output.push(data);
            positionElement.setAttribute('data-g5-position', JSON.stringify(data));
        });

        return JSON.stringify(output).replace(/\//g, '\\/');
    },

    attachEraser() {
        const element = document.querySelector('[data-g5-positions-erase]');
        if (Positions.eraser) {
            Positions.eraser.setElement(element);
            Positions.eraser.hide(true);
            return;
        }
        Positions.eraser = new Eraser(element);
    },

    createSortables(element) {
        Positions.attachEraser();

        groupOptions.forEach((groupOption, groupIndex) => {
            const selector = groupIndex === 0 ? '[data-g5-position] ul' : '#trash';
            const lists = Array.from(document.querySelectorAll(selector));
            let lastSort = null;

            lists.forEach((list, listIndex) => {
                const sort = simpleSort.create(list, {
                    sort: groupIndex === 0,
                    filter: '[data-g5-position-ignore]',
                    group: groupOption,
                    scroll: true,
                    forceFallback: true,
                    animation: 100,

                    onStart(event) {
                        Positions.attachEraser();
                        event.item.classList.add('position-dragging');
                        Positions.eraser.show();
                    },

                    onEnd(event) {
                        const item = event.item;
                        const trash = document.querySelector('#trash');
                        const originalEvent = this.originalEvent || event.originalEvent;
                        const target = originalEvent && originalEvent.target instanceof Element ? originalEvent.target : null;
                        let touchTrash = false;

                        if (originalEvent && originalEvent.type === 'touchend' && trash) {
                            const trashSize = trash.getBoundingClientRect();
                            const point = originalEvent.changedTouches && originalEvent.changedTouches[0];
                            const pageY = originalEvent.pageY || (point && point.pageY) || 0;
                            touchTrash = pageY - window.scrollY <= trashSize.height;
                        }

                        if (trash && ((target && (target === trash || trash.contains(target))) || touchTrash)) {
                            item.remove();
                            Positions.eraser.hide();
                            this.options.onSort(event);
                            return;
                        }

                        item.classList.remove('position-dragging');
                        Positions.eraser.hide();
                    },

                    onSort(event) {
                        const fromPosition = event.from.closest('[data-g5-position]');
                        const toPosition = event.to.closest('[data-g5-position]');
                        const affected = event.from === event.to
                            ? [toPosition]
                            : [fromPosition, toPosition];

                        Positions.serialize(affected.filter(Boolean));
                        Positions.updatePendingChanges();
                    },

                    onOver(event) {
                        if (!event.from.matches('ul')) return;
                        const trash = document.querySelector('#trash');
                        const over = event.related || (event.originalEvent && event.originalEvent.target);
                        if (trash && over instanceof Node && (over === trash || trash.contains(over))) {
                            Positions.eraser.over();
                        } else {
                            Positions.eraser.out();
                        }
                    }
                });

                lastSort = sort;
                if (groupIndex === 0 && !Positions.lists[listIndex]) Positions.lists[listIndex] = sort;
            });

            if (groupIndex === 0 && element) element.SimpleSort = lastSort;
        });
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

module.exports = Positions;
