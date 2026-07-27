"use strict";

const directItems = (list, selector, excluded) => Array.from(list.children)
    .filter(item => item !== excluded && item.matches(selector));

class DraggableGroup {
    constructor(root, options = {}) {
        this.root = root;
        this.options = Object.assign({
            lists: 'ul',
            items: ':scope > *',
            handle: null,
            filter: null,
            trash: null,
            draggingClass: 'native-dragging',
            scrollContainer: null,
            onStart: null,
            onTrashOver: null,
            onEnd: null
        }, options);
        this.drag = null;
        this.trashOver = false;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.root.addEventListener('pointerdown', this.onPointerDown);
        this.root.addEventListener('click', this.onClick, true);
        this.observer = new MutationObserver(() => this.refresh());
        this.observer.observe(this.root, { childList: true, subtree: true });
        this.refresh();
    }

    refresh() {
        this.lists = Array.from(this.root.querySelectorAll(this.options.lists));
        this.trash = typeof this.options.trash === 'string'
            ? this.root.querySelector(this.options.trash)
            : this.options.trash;
    }

    getList(element) {
        const list = element && element.closest(this.options.lists);
        return list && this.lists.includes(list) ? list : null;
    }

    getItem(target) {
        const handle = this.options.handle ? target.closest(this.options.handle) : target;
        if (!handle || !this.root.contains(handle)) return null;

        const item = handle.closest(this.options.items);
        const list = item && this.getList(item);
        if (!item || !list || item.parentElement !== list) return null;
        if (this.options.filter && item.matches(this.options.filter)) return null;
        return item;
    }

    indexOf(list, item) {
        return directItems(list, this.options.items).indexOf(item);
    }

    markStarted() {
        if (!this.drag || this.drag.started) return;

        this.drag.started = true;
        this.drag.previousUserSelect = document.documentElement.style.userSelect;
        document.documentElement.style.userSelect = 'none';
        if (this.options.draggingClass) this.drag.item.classList.add(this.options.draggingClass);
        if (typeof this.options.onStart === 'function') {
            this.options.onStart({
                item: this.drag.item,
                oldIndex: this.drag.oldIndex,
                from: this.drag.from
            });
        }
    }

    setTrashOver(over) {
        if (over === this.trashOver) return;
        this.trashOver = over;
        if (typeof this.options.onTrashOver === 'function') this.options.onTrashOver(over);
    }

    moveTo(list, clientY) {
        const candidates = directItems(list, this.options.items, this.drag.item);
        const before = candidates.find(item => {
            const bounds = item.getBoundingClientRect();
            return clientY < bounds.top + (bounds.height / 2);
        });

        if (before) list.insertBefore(this.drag.item, before);
        else list.appendChild(this.drag.item);
    }

    scrollAt(clientY, list) {
        const container = this.options.scrollContainer
            ? list.closest(this.options.scrollContainer)
            : null;

        if (container) {
            const bounds = container.getBoundingClientRect();
            if (clientY < bounds.top + 36) container.scrollTop -= 12;
            else if (clientY > bounds.bottom - 36) container.scrollTop += 12;
        }

        if (clientY < 50) window.scrollBy(0, -12);
        else if (clientY > window.innerHeight - 50) window.scrollBy(0, 12);
    }

    onPointerDown(event) {
        if (event.button !== 0 || this.drag) return;

        const item = this.getItem(event.target);
        if (!item) return;

        const from = item.parentElement;
        this.drag = {
            item,
            from,
            oldIndex: this.indexOf(from, item),
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            started: false,
            previousUserSelect: ''
        };

        window.addEventListener('pointermove', this.onPointerMove, { passive: false });
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerUp);
    }

    onPointerMove(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        const distance = Math.abs(event.clientX - this.drag.clientX) + Math.abs(event.clientY - this.drag.clientY);
        if (!this.drag.started && distance < 5) return;

        event.preventDefault();
        this.markStarted();

        const over = document.elementFromPoint(event.clientX, event.clientY);
        const overTrash = Boolean(this.trash && over && (over === this.trash || this.trash.contains(over)));
        this.setTrashOver(overTrash);
        if (overTrash) return;

        const list = this.getList(over);
        if (!list) return;
        this.moveTo(list, event.clientY);
        this.scrollAt(event.clientY, list);
    }

    onPointerUp(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        const state = this.drag;
        this.drag = null;
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);

        if (!state.started) return;

        const over = document.elementFromPoint(event.clientX, event.clientY);
        const deleted = event.type !== 'pointercancel'
            && Boolean(this.trash && over && (over === this.trash || this.trash.contains(over)));
        const to = state.item.parentElement;
        if (this.options.draggingClass) state.item.classList.remove(this.options.draggingClass);
        document.documentElement.style.userSelect = state.previousUserSelect;
        this.setTrashOver(false);
        if (deleted) state.item.remove();
        this.suppressClick = event.type !== 'pointercancel';
        setTimeout(() => { this.suppressClick = false; }, 0);

        if (typeof this.options.onEnd === 'function') {
            this.options.onEnd({
                item: state.item,
                oldIndex: state.oldIndex,
                newIndex: deleted ? -1 : this.indexOf(to, state.item),
                from: state.from,
                to,
                deleted,
                originalEvent: event
            });
        }
    }

    onClick(event) {
        if (!this.suppressClick) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.suppressClick = false;
    }

    destroy() {
        this.root.removeEventListener('pointerdown', this.onPointerDown);
        this.root.removeEventListener('click', this.onClick, true);
        this.observer.disconnect();
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);
        if (this.drag) document.documentElement.style.userSelect = this.drag.previousUserSelect;
        this.drag = null;
        this.setTrashOver(false);
    }
}

module.exports = DraggableGroup;
