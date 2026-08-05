"use strict";

const directItems = (list, selector, excluded) => Array.from(list.children)
    .filter(item => item !== excluded && item.matches(selector));

class ReorderableList {
    constructor(list, options = {}) {
        this.list = list;
        this.options = Object.assign({
            item: ':scope > *',
            handle: null,
            filter: null,
            sortingClass: '',
            draggingClass: 'native-reorder-dragging',
            onStart: null,
            onEnd: null
        }, options);
        this.drag = null;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.list.addEventListener('pointerdown', this.onPointerDown);
        this.list.addEventListener('keydown', this.onKeyDown);
        this.observer = new MutationObserver(() => this.prepareHandles());
        this.observer.observe(this.list, { childList: true, subtree: true });
        this.prepareHandles();
    }

    prepareHandles() {
        if (!this.options.handle) return;

        this.list.querySelectorAll(this.options.handle).forEach(handle => {
            if (!handle.hasAttribute('tabindex')) handle.tabIndex = 0;
            if (!handle.hasAttribute('role')) handle.setAttribute('role', 'button');
            handle.style.touchAction = 'none';
        });
    }

    getItem(target) {
        const item = target.closest(this.options.item);
        if (!item || item.parentElement !== this.list) return null;
        if (this.options.filter && item.matches(this.options.filter)) return null;
        return item;
    }

    getHandle(target) {
        if (!this.options.handle) return target;
        const handle = target.closest(this.options.handle);
        return handle && this.list.contains(handle) ? handle : null;
    }

    indexOf(item) {
        return directItems(this.list, this.options.item).indexOf(item);
    }

    start(item, pointerId = null, clientY = null) {
        const oldIndex = this.indexOf(item);
        if (oldIndex < 0) return false;

        this.drag = { item, oldIndex, pointerId, clientY, started: pointerId === null };
        if (this.drag.started) this.markStarted();
        return true;
    }

    markStarted() {
        if (!this.drag || this.drag.marked) return;

        this.drag.marked = true;
        if (this.options.sortingClass) this.list.classList.add(this.options.sortingClass);
        if (this.options.draggingClass) this.drag.item.classList.add(this.options.draggingClass);
        if (typeof this.options.onStart === 'function') {
            this.options.onStart({ item: this.drag.item, oldIndex: this.drag.oldIndex, from: this.list });
        }
    }

    moveTo(clientY) {
        if (!this.drag) return;

        const candidates = directItems(this.list, this.options.item, this.drag.item);
        const before = candidates.find(item => {
            const bounds = item.getBoundingClientRect();
            return clientY < bounds.top + (bounds.height / 2);
        });

        if (before) this.list.insertBefore(this.drag.item, before);
        else this.list.appendChild(this.drag.item);
    }

    finish() {
        if (!this.drag) return;

        const state = this.drag;
        this.drag = null;
        if (!state.marked) return;

        if (this.options.sortingClass) this.list.classList.remove(this.options.sortingClass);
        if (this.options.draggingClass) state.item.classList.remove(this.options.draggingClass);

        const newIndex = this.indexOf(state.item);
        if (typeof this.options.onEnd === 'function') {
            this.options.onEnd({
                item: state.item,
                oldIndex: state.oldIndex,
                newIndex,
                from: this.list,
                to: this.list
            });
        }
    }

    onPointerDown(event) {
        if (event.button !== 0 || this.drag) return;

        const handle = this.getHandle(event.target);
        const item = handle && this.getItem(handle);
        if (!item || !this.start(item, event.pointerId, event.clientY)) return;

        event.preventDefault();
        window.addEventListener('pointermove', this.onPointerMove, { passive: false });
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerUp);
    }

    onPointerMove(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        const distance = Math.abs(event.clientY - this.drag.clientY);
        if (!this.drag.started && distance < 4) return;

        event.preventDefault();
        this.drag.started = true;
        this.markStarted();
        this.moveTo(event.clientY);
    }

    onPointerUp(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);
        this.finish();
    }

    onKeyDown(event) {
        if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;

        const handle = this.getHandle(event.target);
        const item = handle && this.getItem(handle);
        if (!item) return;

        const items = directItems(this.list, this.options.item);
        const oldIndex = items.indexOf(item);
        const newIndex = oldIndex + (event.key === 'ArrowUp' ? -1 : 1);
        if (newIndex < 0 || newIndex >= items.length) return;

        event.preventDefault();
        this.start(item);
        if (newIndex < oldIndex) this.list.insertBefore(item, items[newIndex]);
        else this.list.insertBefore(item, items[newIndex].nextSibling);
        this.finish();
        handle.focus();
    }

    destroy() {
        this.finish();
        this.list.removeEventListener('pointerdown', this.onPointerDown);
        this.list.removeEventListener('keydown', this.onKeyDown);
        this.observer.disconnect();
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        window.removeEventListener('pointercancel', this.onPointerUp);
    }
}

export default ReorderableList;
