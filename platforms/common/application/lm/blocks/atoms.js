import __module0 from './section.js';

"use strict";

let Section = __module0;

let elementFromHTML = function(html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
};

class Atoms extends Section {
    layout() {
        this.deprecated = '<div class="atoms-notice">Looking for Atoms? To make it easier we moved them in the <a href="#"><i class="fa fa-fw fa-list-alt" aria-hidden="true"></i> Page Settings</a>.</div>';
        return '<div class="atoms-section" style="display: none;" data-lm-id="' + this.getId() + '" data-lm-blocktype="' + this.getType() + '"><div class="section-header clearfix"><h4 class="float-left">' + this.getAttribute('name') + '</h4></div></div>';
    }

    getId() {
        return this.id || (this.id = this.options.type);
    }

    onDone() {
        let block = this.block[0];

        if (!block.querySelector('[data-lm-blocktype="atom"]')) {
            let ids = [this.getId()],
                segments = block.querySelectorAll('[data-lm-id]');
            segments.forEach(function(element) { ids.push(element.getAttribute('data-lm-id')); });
            ids.reverse().forEach(function(id) { this.options.builder.remove(id); }, this);
            block.replaceWith(elementFromHTML(this.deprecated));
            this._attachRedirect();
            return;
        }

        if (!block.querySelector('[data-lm-id]')) {
            this.grid.insert(this.block, 'bottom');
            this.options.builder.add(this.grid);
        }
        block.after(elementFromHTML(this.deprecated));
        this._attachRedirect();
    }

    _attachRedirect() {
        let item = document.querySelector('[data-genesis-nav="page"]');
        if (!item) { return; }
        let link = document.querySelector('.atoms-notice a');
        if (!link) { return; }
        link.addEventListener('click', function(event) {
            event.preventDefault();
            item.click();
        });
    }
}

Atoms.prototype.options = {
    type: 'atoms',
    attributes: {name: 'Atoms Section'}
};

export default Atoms;
