"use strict";

const ready = require('../utils/dom').ready;
const decouple = require('../utils/decouple');
const scrollbarWidth = require('../utils/get-scrollbar-width');

let container;
let sidebar;
let search;
let particles;
let heightTop = 0;
let heightBottom = 0;
let initialSidebarCoords;
let realSidebarTop = 0;

const paddingBottom = element => Number.parseInt(getComputedStyle(element).paddingBottom, 10) || 0;

const initSizes = () => {
    container = document.querySelector('.sidebar-block');
    if (!container) return;

    sidebar = container.querySelector('.genesis-lm-particles-picker');
    if (!sidebar) return;

    search = sidebar.querySelector(':scope > .search');
    particles = sidebar.querySelector(':scope > .particles-container');
    if (!search || !particles) return;

    heightTop = 0;
    heightBottom = 0;
    initialSidebarCoords = sidebar.getBoundingClientRect();
    realSidebarTop = sidebar.offsetTop;

    document.querySelectorAll('body.admin.com_genesis nav.navbar-fixed-top, #wpadminbar, #admin-main #titlebar, #admin-main .grav-update.grav')
        .forEach(element => { heightTop += element.offsetHeight; });
    document.querySelectorAll('body.admin.com_genesis #status')
        .forEach(element => { heightBottom += element.offsetHeight; });

    particles.style.maxHeight = `${window.innerHeight - heightTop - heightBottom - search.offsetHeight - 30}px`;
    particles.style.overflow = 'auto';

    const hasScrollbar = particles.scrollHeight !== particles.offsetHeight;
    particles.classList.toggle('has-scrollbar', hasScrollbar);
    particles.style.marginRight = hasScrollbar ? `${-scrollbarWidth()}px` : '';
};

ready(() => {
    initSizes();

    const scrollElement = window.GENESIS_PLATFORM === 'grav'
        ? document.querySelector('#admin-main .content-padding') || window
        : window;

    const scroll = function() {
        if (!container || !sidebar) return;

        const scrollTop = scrollElement === window ? window.scrollY : scrollElement.scrollTop;
        const containerBounds = container.getBoundingClientRect();
        const limit = containerBounds.top + containerBounds.height;
        const sidebarCoords = sidebar.getBoundingClientRect();
        const shouldBeFixed = scrollTop > initialSidebarCoords.top - heightTop - 10 && scrollTop >= realSidebarTop - 10;
        const reachedTheLimit = sidebarCoords.height + 10 + heightTop + paddingBottom(container) >= limit;
        const sidebarTallerThanContainer = containerBounds.height <= sidebarCoords.height;

        sidebar.style.width = `${sidebarCoords.width}px`;
        if (shouldBeFixed && !reachedTheLimit) {
            sidebar.classList.remove('particles-absolute');
            sidebar.classList.add('particles-fixed');
            sidebar.style.top = `${heightTop + 10}px`;
            sidebar.style.bottom = 'inherit';
        } else if (shouldBeFixed && reachedTheLimit &&
            (sidebarTallerThanContainer || (window.GENESIS_PLATFORM === 'grav' && containerBounds.bottom < sidebarCoords.bottom))) {
            sidebar.classList.remove('particles-fixed');
            sidebar.classList.add('particles-absolute');
            sidebar.style.top = 'inherit';
            sidebar.style.bottom = `${paddingBottom(container)}px`;
        } else {
            sidebar.classList.remove('particles-fixed', 'particles-absolute');
            sidebar.style.top = 'inherit';
            sidebar.style.bottom = 'inherit';
        }
    };

    decouple(scrollElement, 'scroll', scroll);
    decouple(window, 'resize', () => {
        if (!particles || !search) return;
        scroll();
        particles.style.maxHeight = `${window.innerHeight - heightTop - heightBottom - search.offsetHeight - 30}px`;
    });

    document.body.addEventListener('statechangeEnd', initSizes);
});

module.exports = initSizes;
