'use strict';

const modal = require('../ui').modal;
const parseAjaxURI = require('../utils/get-ajax-url').parse;
const getAjaxURL = require('../utils/get-ajax-url').global;
const getAjaxSuffix = require('../utils/get-ajax-suffix');
const { ready, delegate } = require('../utils/dom');

const setCollapsed = (section, collapsed) => {
    const icon = section.querySelector('.g-changelog-toggle');
    const details = section.nextElementSibling;
    if (icon) {
        icon.classList.toggle('fa-chevron-down', collapsed);
        icon.classList.toggle('fa-chevron-up', !collapsed);
    }
    if (details) {
        details.hidden = collapsed;
        details.style.overflow = collapsed ? 'hidden' : '';
        details.style.height = collapsed ? '0' : '';
    }
};

ready(() => {
    delegate(document.body, 'click', '[data-changelog]', (event, link) => {
        event.preventDefault();

        modal.open({
            content: 'Loading',
            method: 'post',
            className: 'genesis-dialog-theme-default genesis-modal-changelog',
            data: { version: link.dataset.changelog },
            remote: parseAjaxURI(`${getAjaxURL('changelog')}${getAjaxSuffix()}`),
            remoteLoaded(response, content) {
                if (!response.body.success) return;

                const wrapper = content.elements.content[0] || content.elements.content;
                wrapper.querySelectorAll('#g-changelog > ol > li > a').forEach((section) => {
                    if (!section.textContent.trim()) return;

                    const current = new RegExp(`#(common|${window.GENESIS_PLATFORM})$`, 'i').test(section.href);
                    const icon = document.createElement('i');
                    icon.className = `fa g-changelog-toggle fa-fw fa-chevron-${current ? 'up' : 'down'}`;
                    icon.setAttribute('aria-hidden', 'true');
                    section.append(icon);
                    setCollapsed(section, !current);

                    section.addEventListener('click', (clickEvent) => {
                        clickEvent.preventDefault();
                        const details = section.nextElementSibling;
                        if (details) setCollapsed(section, !details.hidden);
                    });
                });
            }
        });
    });
});

module.exports = {};
