'use strict';

const fallbackValidate = (field) => {
    if (field.disabled) return true;
    const value = field.value || '';
    const checkbox = field.type === 'checkbox' || field.type === 'radio';
    if (field.required && (checkbox ? !field.checked : !value)) return false;
    if (!checkbox && field.minLength >= 0 && value.length < field.minLength) return false;
    if (!checkbox && field.maxLength >= 0 && value.length > field.maxLength) return false;
    if (field.pattern && !(new RegExp(field.pattern)).test(value)) return false;

    const numeric = Number.parseFloat(value);
    if (field.min !== '' && numeric < Number.parseFloat(field.min)) return false;
    if (field.max !== '' && numeric > Number.parseFloat(field.max)) return false;
    return true;
};

module.exports = (input) => {
    const field = input && input[0] ? input[0] : input;
    if (!field || !['INPUT', 'TEXTAREA', 'SELECT'].includes(field.tagName)) return true;

    if (typeof field.checkValidity === 'function') {
        if (field.classList.contains('custom-validation-field')) {
            field.setCustomValidity(fallbackValidate(field) ? '' : 'The field value is invalid');
        }
        return field.checkValidity();
    }
    return fallbackValidate(field);
};
