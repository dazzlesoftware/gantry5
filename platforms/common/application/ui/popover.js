import __module0 from '../utils/dom-effects.js';
import __module1 from '../utils/create-element.js';
import __module2 from '../utils/request.js';

"use strict";

let dom        = __module0,
    zen      = __module1,
    storage  = new WeakMap(),
    instances = new Set(),

    request  = __module2;

let defaults = {
        mainClass: 'genesis-popover',
        placement: 'auto',
        width: 'auto',
        height: 'auto',
        trigger: 'click',
        style: '',
        delay: 300,
        cache: true,
        multi: false,
        arrow: true,
        title: '',
        content: '',
        closeable: false,
        padding: true,
        targetEvents: true,
        allowElementsClick: false,
        url: '',
        type: 'html',
        where: '[data-genesis-container]',
        template: '<div class="genesis-popover">' +
        '<div class="g-arrow"></div>' +
        '<div class="genesis-popover-inner">' +
        '<a href="#" class="close">x</a>' +
        '<h3 class="genesis-popover-title"></h3>' +
        '<div class="genesis-popover-content"><i class="icon-refresh"></i> <p>&nbsp;</p></div>' +
        '</div>' +
        '</div>'
    };

class Popover {
    constructor(element, options) {
        this.options = Object.assign({}, defaults, options || {});
        this._bound = Object.create(null);
        this.element = dom(element);

        if (this.options.trigger === 'click') {
            this.element.off('click', this.bound('toggle')).on('click', this.bound('toggle'));
        } else {
            this.element.off('mouseenter', this.bound('mouseenterHandler')).off('mouseleave', this.bound('mouseleaveHandler'))
                .on('mouseenter', this.bound('mouseenterHandler'))
                .on('mouseleave', this.bound('mouseleaveHandler'));
        }

        this._poped = false;
        instances.add(this);
        //this._inited = true;
    }

    bound(method) {
        if (!this._bound[method]) {
            this._bound[method] = this[method].bind(this);
        }
        return this._bound[method];
    }

    destroy() {
        this.hide(null, false);
        instances.delete(this);
        storage.delete(this.element[0]);
        this.element.off('click', this.bound('toggle')).off('mouseenter', this.bound('mouseenterHandler')).off('mouseleave', this.bound('mouseleaveHandler'));

        if (this.$target) {
            this.$target.remove();
        }
    }

    hide(event, restore = true) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        //let e = $.Event('hide.' + pluginType);
        this.element.emit('hide.popover', this);
        if (this.$target) {
            this.$target.removeClass('in').style({ display: 'none' });
            this.$target.remove();
        }
        this.element.emit('hidden.popover', this);

        if (this._focusAttached) {
            dom('body').off('focus', this.bound('focus'), true);
            this._focusAttached = false;
            if (restore) this.restoreFocus();
        }

        dom('body')
            .off('keyup', this.bound('escapeHandler'))
            .off('click', this.bound('bodyClickHandler'));
    }

    toggle(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this[this.getTarget().hasClass('in') ? 'hide' : 'show']();
    }

    focus(e) {
        if (!this.getTarget().hasClass('in')) { return; }
        let self = this,
            target = dom(e.target || e);

        if (
            this.$target[0] === target[0] || target.parent(this.$target) ||
            this.element[0] === target[0] || target.parent(this.element)
        ) { return; }

        this.hide(null, false);
    }

    restoreFocus(element) {
        element = dom(element || this.element);
        let tag = element.tag();

        setTimeout(function(){
            if (tag != 'a' && tag != 'input' && tag != 'button') {
                let items = element.find('a, button, input');
                if (items) items[0].focus();
            } else {
                element[0].focus();
            }
        }, 0);
    }

    hideAll(force, restore = false) {
        const restoreTarget = restore && this._focusAttached ? this.element : null;

        instances.forEach(instance => {
            const target = instance.$target;
            if (!target || (!force && target.hasClass(instance.options.mainClass + '-fixed'))) return;
            instance.hide(null, false);
        });

        if (restoreTarget) this.restoreFocus(restoreTarget);
        return this;
    }

    show() {
        let target = this.getTarget().attribute('class', null).addClass(this.options.mainClass).attribute('tabindex', '0');

        if (!this.options.multi) {
            this.hideAll();
        }

        // use cache by default, if not cache setted  , reInit the contents
        this.element.emit('beforeshow.popover', this);
        if (!this.options.cache || !this._poped) {
            this.setTitle(this.getTitle());

            if (!this.options.closeable) {
                target.find('.close').off('click').remove();
            }

            if (!this.isAsync()) {
                this.setContent(this.getContent());
            } else {
                this.setContentASync(this.options.content);
                this.displayContent();
                return;
            }

            target.style({ display: 'block' });
        }

        this.displayContent();
        this.bindBodyEvents();

        setTimeout(function(){
            target[0].focus();
        }, 0);

        if (!this._focusAttached) {
            dom('body').on('focus', this.bound('focus'), true);
            this._focusAttached = true;
        }
    }

    displayContent() {
        let elementPos,
            target = this.getTarget().attribute('class', null).addClass(this.options.mainClass),
            targetContent = this.getContentElement(),
            targetWidth, targetHeight, placement;

        this.element.emit('show.popover', this);

        if (this.options.width !== 'auto') {
            target.style({ width: this.options.width });
        }
        if (this.options.height !== 'auto') {
            targetContent.style({ height: this.options.height });
        }

        // init the popover and insert into the document body
        if (!this.options.arrow && target.find('.g-arrow')) {
            target.find('.g-arrow').remove();
        }

        let container = dom(this.options.where);

        // wordpress workaround for out-of-scope cases
        if (GENESIS_PLATFORM == 'wordpress') {
            container = dom('#widgets-editor') || dom('#customize-preview') || dom('#widgets-right') || dom(this.options.where);
            if ('#' + container.id() != this.options.where) {
                let wpwrap = dom('#wpwrap') || dom('.wp-customizer'), sibling, workaround;
                if (wpwrap.id() == 'wpwrap') {
                    sibling = wpwrap.nextSibling(this.options.where);
                    workaround =  sibling ? sibling : zen('div.g5wp-out-of-scope' + this.options.where).after(wpwrap);
                } else {
                    sibling = wpwrap.find('> ' + this.options.where);
                    workaround =  sibling ? sibling : zen('div.g5wp-out-of-scope' + this.options.where).top(wpwrap);
                }
                container = workaround;
            }
        }

        target.remove().style({
            top: -1000,
            left: -1000,
            display: 'block'
        }).bottom(container);

        const anchorRect = this.element[0].getBoundingClientRect();
        const offsetParent = target[0].offsetParent || document.documentElement;
        const parentRect = offsetParent.getBoundingClientRect();
        elementPos = {
            left: anchorRect.left - parentRect.left + offsetParent.scrollLeft,
            top: anchorRect.top - parentRect.top + offsetParent.scrollTop,
            width: anchorRect.width,
            height: anchorRect.height
        };

        if (this.options.style) {
            if (typeof this.options.style === 'string') {
                this.options.style = this.options.style.split(',').map(Function.prototype.call, String.prototype.trim);
            }

            this.options.style.forEach(function(style) {
                this.$target.addClass(this.options.mainClass + '-' + style);
            }, this);
        }

        if (!this.options.padding) {
            targetContent.css('height', targetContent.position().height);
            this.$target.addClass('genesis-popover-no-padding');
        }

        targetWidth = target[0].offsetWidth;
        targetHeight = target[0].offsetHeight;
        placement = this.getPlacement(elementPos, targetHeight);
        if (this.options.targetEvents) { this.initTargetEvents(); }
        let positionInfo = this.getTargetPosition(elementPos, placement, targetWidth, targetHeight);
        this.$target.style(positionInfo.position).addClass(placement).addClass('in');

        if (this.options.type === 'iframe') {
            let iframe = target.find('iframe');
            iframe.style({
                width: target.position().width,
                height: iframe.parent().position.height
            });
        }

        if (!this.options.arrow) {
            this.$target.style({ 'margin': 0 });
        }
        if (this.options.arrow) {
            let arrow = this.$target.find('.g-arrow');
            arrow.attribute('style', null);
            if (positionInfo.arrowOffset) {
                arrow.style(positionInfo.arrowOffset);
            }
        }

        this._poped = true;
        this.element[0].focus();
        this.element.emit('shown.popover', this);

    }


    /*getter setters */
    getTarget() {
        if (!this.$target) {
            this.$target = dom(zen('div').html(this.options.template).children()[0]);
        }
        return this.$target;
    }

    getTitleElement() {
        return this.getTarget().find('.' + this.options.mainClass + '-title');
    }

    getContentElement() {
        return this.getTarget().find('.' + this.options.mainClass + '-content');
    }

    getTitle() {
        return this.options.title || this.element.data('genesis-popover-title') || this.element.attribute('title');
    }

    setTitle(title) {
        let element = this.getTitleElement();
        if (title) {
            element.html(title);
        }
        else {
            element.remove();
        }
    }

    hasContent() {
        return this.getContent();
    }

    getContent() {
        if (this.options.url) {
            if (this.options.type === 'iframe') {
                this.content = dom('<iframe frameborder="0"></iframe>').attribute('src', this.options.url);
            }
        } else if (!this.content) {
            let content = '';
            if (typeof this.options.content === 'function') {
                content = this.options.content.apply(this.element[0], arguments);
            } else {
                content = this.options.content;
            }
            this.content = this.element.data('genesis-popover-content') || content;
        }
        return this.content;
    }

    setContent(content) {
        let target = this.getTarget();
        this.getContentElement().html(content);
        this.$target = target;
    }

    isAsync() {
        return this.options.type === 'async';
    }

    setContentASync(content) {
        request('get', this.options.url, function(error, response) {
            if (content && typeof content === 'function') {
                this.content = content.apply(this.element[0], [response]);
            } else {
                this.content = response.body.html;
            }

            this.setContent(this.content);

            let target = this.getContentElement();
            target.attribute('style', null);

            setTimeout(function(){
                target.parent('.' + this.options.mainClass)[0].focus();
            }.bind(this), 0);

            this.displayContent();
            this.bindBodyEvents();

            let selects = dom('[data-selectize]');
            if (selects) { selects.selectize(); }
        }.bind(this));
    }

    bindBodyEvents() {
        let body = dom('body');
        body.off('keyup', this.bound('escapeHandler')).on('keyup', this.bound('escapeHandler'));
        body.off('click', this.bound('bodyClickHandler')).on('click', this.bound('bodyClickHandler'));
    }


    /* event handlers */
    mouseenterHandler() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        if (!(this.getTarget()[0].offsetWidth > 0 || this.getTarget()[0].offsetHeight > 0)) {
            this.show();
        }
    }
    mouseleaveHandler() {
        // key point, set the _timeout  then use clearTimeout when mouse leave
        this._timeout = setTimeout(function() {
            this.hide();
        }.bind(this), this.options.delay);
    }

    escapeHandler(e) {
        if (e.keyCode === 27) {
            this.hideAll(false, true);
        }
    }

    bodyClickHandler() {
        this.hideAll();
    }

    targetClickHandler(e) {
        let target = dom(e.target);
        if (target.matches(this.options.allowElementsClick)) { e.preventDefault(); }
        if (!target.parent('[data-g-popover-follow]') && target.data('g-popover-follow') === null) { e.stopPropagation(); }
    }

    initTargetEvents() {
        if (this.options.trigger !== 'click') {
            this.$target
                .off('mouseenter', this.bound('mouseenterHandler'))
                .off('mouseleave', this.bound('mouseleaveHandler'))
                .on('mouseenter', this.bound('mouseenterHandler'))
                .on('mouseleave', this.bound('mouseleaveHandler'));
        }

        let close = this.$target.find('.close');
        if (close) {
            close.off('click', this.bound('hide')).on('click', this.bound('hide'));
        }

        this.$target.off('click', this.bound('targetClickHandler')).on('click', this.bound('targetClickHandler'));
    }

    /* utils methods */
    getPlacement(pos, targetHeight) {
        let
            placement,
            de = document.documentElement,
            clientWidth = de.clientWidth,
            clientHeight = de.clientHeight,
            anchorRect = this.element[0].getBoundingClientRect(),
            pageX = Math.max(0, anchorRect.left),
            pageY = Math.max(0, anchorRect.top),
            arrowSize = 20;

        // if placement equals auto，caculate the placement by element information;
        if (typeof(this.options.placement) === 'function') {
            placement = this.options.placement.call(this, this.getTarget()[0], this.element[0]);
        } else {
            placement = this.element.data('genesis-popover-placement') || this.options.placement;
        }

        if (placement === 'auto') {
            if (pageX < clientWidth / 3) {
                if (pageY < clientHeight / 3) {
                    placement = 'bottom-right';
                } else if (pageY < clientHeight * 2 / 3) {
                    placement = 'right';
                } else {
                    placement = 'top-right';
                }
                //placement= pageY>targetHeight+arrowSize?'top-right':'bottom-right';
            } else if (pageX < clientWidth * 2 / 3) {
                if (pageY < clientHeight / 3) {
                    placement = 'bottom';
                } else if (pageY < clientHeight * 2 / 3) {
                    placement = 'bottom';
                } else {
                    placement = 'top';
                }
            } else {
                placement = pageY > targetHeight + arrowSize ? 'top-left' : 'bottom-left';
                if (pageY < clientHeight / 3) {
                    placement = 'bottom-left';
                } else if (pageY < clientHeight * 2 / 3) {
                    placement = 'left';
                } else {
                    placement = 'top-left';
                }
            }
        }
        return placement;
    }

    getTargetPosition(elementPos, placement, targetWidth, targetHeight) {
        let pos = elementPos,
            elementW = this.element[0].offsetWidth,
            elementH = this.element[0].offsetHeight,
            position = {},
            arrowOffset = null,
            arrowSize = this.options.arrow ? 28 : 0,
            fixedW = elementW < arrowSize + 10 ? arrowSize : 0,
            fixedH = elementH < arrowSize + 10 ? arrowSize : 0;

        switch (placement) {
            case 'bottom':
                position = {
                    top: pos.top + pos.height,
                    left: pos.left + pos.width / 2 - targetWidth / 2
                };
                break;
            case 'top':
                position = {
                    top: pos.top - targetHeight,
                    left: pos.left + pos.width / 2 - targetWidth / 2
                };
                break;
            case 'left':
                position = {
                    top: pos.top + pos.height / 2 - targetHeight / 2,
                    left: pos.left - targetWidth
                };
                break;
            case 'right':
                position = {
                    top: pos.top + pos.height / 2 - targetHeight / 2,
                    left: pos.left + pos.width
                };
                break;
            case 'top-right':
                position = {
                    top: pos.top - targetHeight,
                    left: pos.left - fixedW
                };
                arrowOffset = { left: elementW / 2 + fixedW };
                break;
            case 'top-left':
                position = {
                    top: pos.top - targetHeight,
                    left: pos.left - targetWidth + pos.width + fixedW
                };
                arrowOffset = { left: targetWidth - elementW / 2 - fixedW };
                break;
            case 'bottom-right':
                position = {
                    top: pos.top + pos.height,
                    left: pos.left - fixedW
                };
                arrowOffset = { left: elementW / 2 + fixedW };
                break;
            case 'bottom-left':
                position = {
                    top: pos.top + pos.height,
                    left: pos.left - targetWidth + pos.width + fixedW
                };
                arrowOffset = { left: targetWidth - elementW / 2 - fixedW };
                break;
            case 'right-top':
                position = {
                    top: pos.top - targetHeight + pos.height + fixedH,
                    left: pos.left + pos.width
                };
                arrowOffset = { top: targetHeight - elementH / 2 - fixedH };
                break;
            case 'right-bottom':
                position = {
                    top: pos.top - fixedH,
                    left: pos.left + pos.width
                };
                arrowOffset = { top: elementH / 2 + fixedH };
                break;
            case 'left-top':
                position = {
                    top: pos.top - targetHeight + pos.height + fixedH,
                    left: pos.left - targetWidth
                };
                arrowOffset = { top: targetHeight - elementH / 2 - fixedH };
                break;
            case 'left-bottom':
                position = {
                    top: pos.top,
                    left: pos.left - targetWidth
                };
                arrowOffset = { top: elementH / 2 };
                break;

        }

        return {
            position: position,
            arrowOffset: arrowOffset
        };
    }

}

dom.implement({
    getPopover: function(options) {
        let element = this[0],
            popover = storage.get(element);

        if (!popover && options !== 'destroy') {
            options = options || {};
            popover = new Popover(element, options);
            storage.set(element, popover);
            this.PopoverDefined = true;
            element.PopoverDefined = true;
        }

        return popover;
    },

    popover: function(options) {
        return this.forEach(function(element) {
            let popover = storage.get(element);

            if (!popover && options !== 'destroy') {
                options = options || {};
                popover = new Popover(element, options);
                storage.set(element, popover);
            }
        });
    },

    position: function() {
        let node = this[0],
            ct = dom('[data-genesis-container]')[0].getBoundingClientRect(),
            box = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

        if (typeof node.getBoundingClientRect !== "undefined") {
            box = node.getBoundingClientRect();
        }

        return {
            x: box.left - ct.left,
            left: box.left - ct.left,
            y: box.top - ct.top,
            top: box.top - ct.top,
            right: box.right - ct.right,
            bottom: box.bottom - ct.bottom,
            width: box.right - box.left,
            height: box.bottom - box.top
        };
    }
});

dom.create = function(element, options) {
    let popover = storage.get(element);
    if (!popover) {
        popover = new Popover(element, options || {});
        storage.set(element, popover);
        element.PopoverDefined = true;
    }
    return popover;
};

document.addEventListener('genesis:content-replacing', () => {
    instances.forEach(instance => instance.hide(null, false));
});

export default dom;
