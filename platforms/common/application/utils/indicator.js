'use strict';

var asElement = function(element) {
    return element && element.nodeType ? element : element && element[0];
};

var show = function(element, className, keepIcon) {
    element = asElement(element);
    if (!element) { return; }

    if (typeof className === 'boolean') {
        keepIcon = className;
        className = null;
    }

    var icon = keepIcon ? null : element.querySelector('i');
    element.gHadIcon = Boolean(icon);

    if (!icon) {
        if (!element.querySelector('span') && element.children.length === 0) {
            var label = document.createElement('span');
            label.textContent = element.textContent;
            element.textContent = '';
            element.appendChild(label);
        }
        icon = document.createElement('i');
        element.insertBefore(icon, element.firstChild);
    }

    if (!element.gIndicator) { element.gIndicator = icon.getAttribute('class') || true; }
    icon.setAttribute('class', className || 'fa fa-fw fa-spin-fast fa-spinner');
};

var hide = function(element) {
    element = asElement(element);
    if (!element || !element.gIndicator) { return; }

    var icon = element.querySelector('i');
    if (!icon) { return; }

    if (!element.gHadIcon) { icon.remove(); }
    else { icon.setAttribute('class', element.gIndicator); }
    element.gIndicator = null;
};

export default { show: show, hide: hide };
