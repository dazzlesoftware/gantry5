'use strict';

module.exports = (key, replacement = '') => {
    const translate = window.GenesisTranslate || window.G5T || ((value) => value);
    return String(translate(key)).split('%s').join(replacement);
};
