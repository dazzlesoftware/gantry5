'use strict';

module.exports = (key, replacement = '') => {
    const translate = window.GenesisTranslate || window.GenesisT || ((value) => value);
    return String(translate(key)).split('%s').join(replacement);
};
