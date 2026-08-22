<?php

declare(strict_types=1);
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\MultiLanguage;

/**
 * Class Wpml
 * @package Genesis\WordPress\MultiLanguage
 */
class Wpml extends WordPress
{
    /**
     * @return bool
     */
    public static function enabled(): bool
    {
        return \apply_filters('wpml_current_language', null) !== null;
    }

    /*
    public function getCurrentLanguage()
    {
        return apply_filters('wpml_current_language', null);
    }

    public function getLanguageOptions()
    {
        $languages = (array) apply_filters('wpml_active_languages', null);

        $items = [];
        foreach ($languages as $language) {
            $items[] = [
                'name' => $language['language_code'],
                'label' => $language['translated_name'],
            ];
        }

        return $items;
    }
    */
}
