import History from './history-adapter.js';

'use strict';

const absoluteURL = value => new URL(value || window.location.href, window.location.href).href;
const stateFrom = (data, title, url) => ({
    data: data && typeof data === 'object' ? data : {},
    title: title || document.title,
    url: absoluteURL(url)
});

let currentState = stateFrom(window.history.state, document.title, window.location.href);

const dispatchStateChange = () => {
    window.dispatchEvent(new CustomEvent('statechange', {
        detail: { state: currentState }
    }));
};

History.getState = () => ({
    data: currentState.data,
    title: currentState.title,
    url: currentState.url
});

History.getPageUrl = () => absoluteURL(window.location.href).replace(/#.*$/, '');

History.pushState = (data, title, url) => {
    currentState = stateFrom(data, title, url);
    window.history.pushState(currentState.data, currentState.title, currentState.url);
    if (currentState.title) document.title = currentState.title;
    dispatchStateChange();
    return true;
};

History.replaceState = (data, title, url) => {
    currentState = stateFrom(data, title, url);
    window.history.replaceState(currentState.data, currentState.title, currentState.url);
    if (currentState.title) document.title = currentState.title;
    dispatchStateChange();
    return true;
};

History.back = () => window.history.back();
History.forward = () => window.history.forward();
History.go = distance => window.history.go(distance);

window.addEventListener('popstate', event => {
    currentState = stateFrom(event.state, document.title, window.location.href);
    dispatchStateChange();
});

window.History = History;

export default History;
