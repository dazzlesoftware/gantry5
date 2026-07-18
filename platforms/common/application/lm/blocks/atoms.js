"use strict";

var Section = require('./section');

var elementFromHTML = function(html) {
    var template = document.createElement('template');
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
        var block = this.block[0];

        if (!block.querySelector('[data-lm-blocktype="atom"]')) {
            var ids = [this.getId()],
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
        var item = document.querySelector('[data-g5-nav="page"]');
        if (!item) { return; }
        var link = document.querySelector('.atoms-notice a');
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

module.exports = Atoms;
