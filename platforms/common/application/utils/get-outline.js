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
    return instance ? String(instance.getValue()).trim() : '';
};

module.exports = { getOutlineNameById, getCurrentOutline };
