'use strict';

const selectize = () => {
    const selector = document.querySelector('#configuration-selector');
    return selector ? selector.selectizeInstance : null;
};

const getOutlineNameById = (outline) => {
    if (outline == null) return '';
    const instance = selectize();
    const option = instance && instance.Options ? instance.Options[outline] : null;
    return option && option.text ? String(option.text).trim() : '';
};

const getCurrentOutline = () => {
    const instance = selectize();
    const selected = instance ? String(instance.getValue() || '').trim() : '';
    if (selected) return selected;

    const selector = document.querySelector('#configuration-selector');
    const nativeValue = selector ? String(selector.value || '').trim() : '';
    if (nativeValue) return nativeValue;

    // AJAX outline duplication can briefly leave Selectize without a value.
    // Both the page URL and WordPress admin AJAX URL retain the active style.
    const urls = [window.location.href, window.GENESIS_AJAX_CONF_URL];
    for (const value of urls) {
        if (!value) continue;
        try {
            const url = new URL(value, window.location.href);
            const outline = url.searchParams.get('style');
            if (outline) return outline.trim();
        } catch (error) {
            // Ignore malformed optional fallback URLs.
        }
    }

    return '';
};

export default { getOutlineNameById, getCurrentOutline };
