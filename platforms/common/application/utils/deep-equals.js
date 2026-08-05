'use strict';

var deepEquals = function(first, second) {
    if (Object.is(first, second)) { return true; }
    if (typeof first !== typeof second || first === null || second === null) { return false; }
    if (typeof first !== 'object') { return false; }

    if (Array.isArray(first) || Array.isArray(second)) {
        if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) { return false; }

        return first.every(function(value, index) {
            return deepEquals(value, second[index]);
        });
    }

    var firstKeys = Object.keys(first),
        secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) { return false; }

    return firstKeys.every(function(key) {
        return Object.prototype.hasOwnProperty.call(second, key) && deepEquals(first[key], second[key]);
    });
};

export default deepEquals;
