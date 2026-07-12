'use strict';

const getAjaxSuffix = require('./get-ajax-suffix');

const decodeHtml = (value) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
};

const replaceView = (template, view, search = '%ajax%') =>
    decodeHtml(String(template || '').split(search).join(view));

const getAjaxURL = (view, search) => replaceView(window.GANTRY_AJAX_URL, view, search);
const getConfAjaxURL = (view, search) => replaceView(window.GANTRY_AJAX_CONF_URL, view, search);

const parseAjaxURI = (uri) => {
    let result = String(uri || '');

    if (window.GANTRY_PLATFORM === 'wordpress') {
        return result.replace(/themes\.php/ig, 'admin-ajax.php');
    }

    if (window.GANTRY_PLATFORM === 'grav') {
        const suffix = getAjaxSuffix();
        const queryIndex = result.indexOf('?');
        if (suffix && queryIndex !== -1 && result.endsWith(suffix)) {
            const path = result.slice(0, queryIndex);
            const params = new URLSearchParams(result.slice(queryIndex + 1));
            const nonce = params.get('nonce');
            if (nonce && nonce.endsWith(suffix)) params.set('nonce', nonce.slice(0, -suffix.length));
            result = `${path}${suffix}?${params.toString()}`;
        }
    }

    return result;
};

module.exports = { global: getAjaxURL, config: getConfAjaxURL, parse: parseAjaxURI };
