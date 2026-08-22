<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;

/**
 * Data validation.
 *
 * @author Dazzle Software https://dazzlesoftware.org
 * @license MIT
 */
class Validation
{
    /**
     * Validate value against a blueprint field definition.
     *
     * @param mixed $value
     * @param array $field
     * @return array
     */
    public static function validate(mixed $value, array $field): array
    {
        $messages = [];

        $validate = isset($field['validate']) ? (array) $field['validate'] : [];

        // If value isn't required, we will stop validation if empty value is given.
        if (($value === null || $value === '') && empty($validate['required'])) {
            return $messages;
        }

        if (!isset($field['type'])) {
            $field['type'] = 'input.text';
        }

        // Special case for files, value is never empty and errors with code 4 instead.
        if (empty($validate['required']) && $field['type'] === 'input.file' && isset($value['error'])
                && ($value['error'] === UPLOAD_ERR_NO_FILE || \in_array(UPLOAD_ERR_NO_FILE, $value['error'], true))) {
            return $messages;
        }

        // Validate type with fallback type text.
        $type = (string) isset($field['validate']['type']) ? $field['validate']['type'] : $field['type'];
        $method = 'type_'.strtr($type, '-.', '__');

        if (!method_exists(__CLASS__, $method)) {
            $method = 'type_Input_Text';
        }

        $name = ucfirst(isset($field['label']) ? $field['label'] : $field['name']);
        // TODO: translate
        $message = (string) isset($field['validate']['message'])
            ? sprintf($field['validate']['message'])
            : sprintf('Invalid input in field: ') . ' "' . $name . '"';

        $success = self::$method($value, $validate, $field);

        if (!$success) {
            $messages[$field['name']][] = $message;
        }

        // Check individual rules.
        foreach ($validate as $rule => $params) {
            $method = 'validate_' . ucfirst(strtr($rule, '-.', '__'));

            if (method_exists(__CLASS__, $method)) {
                $success = self::$method($value, $params);

                if (!$success) {
                    $messages[$field['name']][] = $message;
                }
            }
        }

        return $messages;
    }

    /**
     * Filter value against a blueprint field definition.
     *
     * @param  mixed  $value
     * @param  array  $field
     * @return mixed  Filtered value.
     */
    public static function filter(mixed $value, array $field): mixed
    {
        $validate = isset($field['validate']) ? (array) $field['validate'] : [];

        // If value isn't required, we will return null if empty value is given.
        if (($value === null || $value === '') && empty($validate['required'])) {
            return null;
        }

        if (!isset($field['type'])) {
            $field['type'] = 'input.text';
        }

        // Special case for files, value is never empty and errors with code 4 instead.
        if (empty($validate['required']) && $field['type'] === 'input.file' && isset($value['error'])
            && ($value['error'] === UPLOAD_ERR_NO_FILE || \in_array(UPLOAD_ERR_NO_FILE, $value['error'], true))) {
            return null;
        }

        // Validate type with fallback type text.
        $type = (string) isset($field['validate']['type']) ? $field['validate']['type'] : $field['type'];
        $method = 'filter_' . ucfirst(str_replace('-', '_', $type));

        if (!method_exists(__CLASS__, $method)) {
            $method = 'filter_Input_Text';
        }

        return self::$method($value, $validate, $field);
    }

    /**
     * HTML5 input: text
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Text(mixed $value, array $params, array $field): bool
    {
        if (!\is_string($value) && !is_numeric($value)) {
            return false;
        }

        $value = (string)$value;

        if (isset($params['min']) && \strlen($value) < $params['min']) {
            return false;
        }

        if (isset($params['max']) && \strlen($value) > $params['max']) {
            return false;
        }

        $min = isset($params['min']) ? $params['min'] : 0;
        if (isset($params['step']) && (strlen($value) - $min) % $params['step'] === 0) {
            return false;
        }

        if ((!isset($params['multiline']) || !$params['multiline']) && preg_match('/\R/um', $value)) {
            return false;
        }

        return true;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return string
     */
    protected static function filter_Input_Text(mixed $value, array $params, array $field): string
    {
        return (string) $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return array|array[]|false|string[]
     */
    protected static function filter_Input_CommaList(mixed $value, array $params, array $field): array|false
    {
        return \is_array($value) ? $value : preg_split('/\s*,\s*/', $value, -1, PREG_SPLIT_NO_EMPTY);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return bool
     */
    protected static function type_Input_CommaList(mixed $value, array $params, array $field): bool
    {
        return \is_array($value) ? true : self::type_Input_Text($value, $params, $field);
    }

    /**
     * HTML5 input: textarea
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Textarea_Textarea(mixed $value, array $params, array $field): bool
    {
        if (!isset($params['multiline'])) {
            $params['multiline'] = true;
        }

        return self::type_Input_Text($value, $params, $field);
    }

    /**
     * HTML5 input: password
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Password(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Text($value, $params, $field);
    }

    /**
     * HTML5 input: hidden
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Hidden(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Text($value, $params, $field);
    }

    /**
     * Custom input: checkbox list
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Checkboxes_Checkboxes(mixed $value, array $params, array $field): bool
    {
        // Set multiple: true so checkboxes can easily use min/max counts to control number of options required
        $field['multiple'] = true;

        return self::typeArray((array) $value, $params, $field);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return array|null
     */
    protected static function filter_Checkboxes_Checkboxes(mixed $value, array $params, array $field): mixed
    {
        return self::filterArray($value, $params, $field);
    }

    /**
     * HTML5 input: checkbox
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Checkbox(mixed $value, array $params, array $field): bool
    {
        $value = (string) $value;

        if (!isset($field['value'])) {
            $field['value'] = 1;
        }

        return !($value && $value != $field['value']);
    }

    /**
     * HTML5 input: radio
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Radio(mixed $value, array $params, array $field): bool
    {
        return self::typeArray((array) $value, $params, $field);
    }

    /**
     * Custom input: toggle
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Toggle_Toggle(mixed $value, array $params, array $field): bool
    {
        return self::typeArray((array) $value, $params, $field);
    }

    /**
     * Custom input: file
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_File(mixed $value, array $params, array $field): bool
    {
        return self::typeArray((array) $value, $params, $field);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return array|mixed
     */
    protected static function filter_Input_File(mixed $value, array $params, array $field): mixed
    {
        if (isset($field['multiple']) && $field['multiple'] === true) {
            return (array) $value;
        }

        if (\is_array($value)) {
            return reset($value);
        }

        return $value;
    }

    /**
     * HTML5 input: select
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Select_Select(mixed $value, array $params, array $field): bool
    {
        return self::typeArray((array) $value, $params, $field);
    }

    /**
     * HTML5 input: number
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Number(mixed $value, array $params, array $field): bool
    {
        if (!is_numeric($value)) {
            return false;
        }

        if (isset($params['min']) && $value < $params['min']) {
            return false;
        }

        if (isset($params['max']) && $value > $params['max']) {
            return false;
        }

        $min = isset($params['min']) ? $params['min'] : 0;

        return !(isset($params['step']) && fmod($value - $min, $params['step']) === 0.0);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return float|int
     */
    protected static function filter_Input_Number(mixed $value, array $params, array $field): int|float
    {
        return (string)(int)$value !== (string)(float)$value ? (float) $value : (int) $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return string
     * @throws \Exception
     */
    protected static function filter_Input_DateTime(mixed $value, array $params, array $field): string
    {
        $converted = new \DateTime($value);

        return $converted->format('Y-m-d H:i:s');
    }


    /**
     * HTML5 input: range
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Range(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Number($value, $params, $field);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return float|int
     */
    protected static function filter_Input_Range(mixed $value, array $params, array $field): int|float
    {
        return self::filter_Input_Number($value, $params, $field);
    }

    /**
     * HTML5 input: color
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Color(mixed $value, array $params, array $field): bool
    {
        return preg_match('/^#[0-9a-fA-F]{3}[0-9a-fA-F]{3}?$/u', (string) $value) === 1;
    }

    /**
     * HTML5 input: email
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Email(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Text($value, $params, $field) && filter_var($value, FILTER_VALIDATE_EMAIL);
    }

    /**
     * HTML5 input: url
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */

    public static function type_Input_Url(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Text($value, $params, $field) && filter_var($value, FILTER_VALIDATE_URL);
    }

    /**
     * HTML5 input: datetime
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Datetime(mixed $value, array $params, array $field): bool
    {
        if ($value instanceof \DateTime) {
            return true;
        }

        if (!\is_string($value)) {
            return false;
        }

        if (!isset($params['format'])) {
            return false !== strtotime($value);
        }

        $dateFromFormat = \DateTime::createFromFormat($params['format'], $value);

        return $dateFromFormat && $value === gmdate($params['format'], $dateFromFormat->getTimestamp());
    }

    /**
     * HTML5 input: datetime-local
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_DatetimeLocal(mixed $value, array $params, array $field): bool
    {
        return self::type_Input_Datetime($value, $params, $field);
    }

    /**
     * HTML5 input: date
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Date(mixed $value, array $params, array $field): bool
    {
        if (!isset($params['format'])) {
            $params['format'] = 'Y-m-d';
        }

        return self::type_Input_Datetime($value, $params, $field);
    }

    /**
     * HTML5 input: time
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Time(mixed $value, array $params, array $field): bool
    {
        if (!isset($params['format'])) {
            $params['format'] = 'H:i';
        }

        return self::type_Input_Datetime($value, $params, $field);
    }

    /**
     * HTML5 input: month
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Month(mixed $value, array $params, array $field): bool
    {
        if (!isset($params['format'])) {
            $params['format'] = 'Y-m';
        }

        return self::type_Input_Datetime($value, $params, $field);
    }

    /**
     * HTML5 input: week
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Input_Week(mixed $value, array $params, array $field): bool
    {
        if (!isset($params['format']) && !preg_match('/^\d{4}-W\d{2}$/u', $value)) {
            return false;
        }

        return self::type_Input_Datetime($value, $params, $field);
    }

    /**
     * Custom input: array
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function typeArray(mixed $value, array $params, array $field): bool
    {
        if (!\is_array($value)) {
            return false;
        }

        if (isset($field['multiple'])) {
            if (isset($params['min']) && \count($value) < $params['min']) {
                return false;
            }

            if (isset($params['max']) && \count($value) > $params['max']) {
                return false;
            }

            $min = isset($params['min']) ? $params['min'] : 0;
            if (isset($params['step']) && (\count($value) - $min) % $params['step'] === 0) {
                return false;
            }
        }

        $options = isset($field['options']) ? array_keys($field['options']) : [];
        $values = isset($field['use']) && $field['use'] === 'keys' ? array_keys($value) : $value;

        return !($options && array_diff($values, $options));
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return array|null
     */
    protected static function filterArray(mixed $value, mixed $params, mixed $field): mixed
    {
        $values = (array) $value;
        $options = isset($field['options']) ? array_keys($field['options']) : [];
        $multi = isset($field['multiple']) ? $field['multiple'] : false;

        if (\count($values) === 1 && isset($values[0]) && $values[0] === '') {
            return null;
        }

        if ($options) {
            $useKey = isset($field['use']) && $field['use'] === 'keys';
            foreach ($values as $key => $val) {
                $values[$key] = $useKey ? (bool) $val : $val;
            }
        }

        if ($multi) {
            foreach ($values as $key => $val) {
                if (\is_array($val)) {
                    $val = implode(',', $val);
                }

                $values[$key] =  array_map('trim', explode(',', $val));
            }
        }

        return $values;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function type_Input_Yaml(mixed $value, mixed $params): bool
    {
        try {
            Yaml::parse($value);

            return true;
        } catch (ParseException $e) {
            return false;
        }
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return array|null
     */
    public static function filter_Input_Yaml(mixed $value, mixed $params): mixed
    {
        try {
            return (array) Yaml::parse($value);
        } catch (ParseException $e) {
            return null;
        }
    }

    /**
     * Custom input: ignore (will not validate)
     *
     * @param  mixed  $value   Value to be validated.
     * @param  array  $params  Validation parameters.
     * @param  array  $field   Blueprint for the field.
     * @return bool   True if validation succeeded.
     */
    public static function type_Novalidate(mixed $value, array $params, array $field): bool
    {
        return true;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @param array $field
     * @return mixed
     */
    public static function filter_Novalidate(mixed $value, array $params, array $field): mixed
    {
        return $value;
    }

    // HTML5 attributes (min, max and range are handled inside the types)

    /**
     * @param mixed $value
     * @param bool $params
     * @return bool
     */
    public static function validate_Required(mixed $value, mixed $params): bool
    {
        if (is_scalar($value)) {
            return (bool) $params !== true || $value !== '';
        }

        return (bool) $params !== true || !empty($value);
    }

    /**
     * @param mixed $value
     * @param string $params
     * @return bool
     */
    public static function validate_Pattern(mixed $value, mixed $params): bool
    {
        return (bool) preg_match("`^{$params}$`u", $value);
    }


    // Internal types

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Alpha(mixed $value, mixed $params): bool
    {
        return ctype_alpha($value);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Alnum(mixed $value, mixed $params): bool
    {
        return ctype_alnum($value);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function type_Bool(mixed $value, mixed $params): bool
    {
        return \is_bool($value) || $value == 1 || $value == 0;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Bool(mixed $value, mixed $params): bool
    {
        return \is_bool($value) || $value == 1 || $value == 0;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    protected static function filter_Bool(mixed $value, mixed $params): bool
    {
        return (bool) $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Digit(mixed $value, mixed $params): bool
    {
        return ctype_digit($value);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Float(mixed $value, mixed $params): bool
    {
        return \is_float(filter_var($value, FILTER_VALIDATE_FLOAT));
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return float
     */
    protected static function filter_Float(mixed $value, mixed $params): float
    {
        return (float) $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Hex(mixed $value, mixed $params): bool
    {
        return ctype_xdigit($value);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Int(mixed $value, mixed $params): bool
    {
        return is_numeric($value) && (int) $value == $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return int
     */
    protected static function filter_Int(mixed $value, mixed $params): int
    {
        return (int) $value;
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Array(mixed $value, mixed $params): bool
    {
        return \is_array($value)
            || ($value instanceof \ArrayAccess
                && $value instanceof \Traversable
                && $value instanceof \Countable);
    }

    /**
     * @param mixed $value
     * @param array $params
     * @return bool
     */
    public static function validate_Json(mixed $value, mixed $params): bool
    {
        return (bool) (@json_decode($value));
    }
}
