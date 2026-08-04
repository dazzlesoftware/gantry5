<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\MultiLanguage;

/**
 * Class WordPress
 * @package Genesis\WordPress\MultiLanguage
 */
class WordPress implements MultiLantuageInterface
{
    /**
     * @return bool
     */
    public static function enabled()
    {
        return true;
    }

    /**
     * @return string
     */
    public function getCurrentLanguage()
    {
        return \get_locale();
    }

    /**
     * @return array
     */
    public function getLanguageOptions()
    {
        require_once ABSPATH . 'wp-admin/includes/translation-install.php';
        $translations = \wp_get_available_translations();
        $languages = \get_available_languages();

        $items = [['name' => 'en_US', 'label' => 'English (United States)']];

        foreach ($languages as $locale) {
            if (isset($translations[$locale])) {
                $translation = $translations[$locale];
                $items[] = [
                    'name'  => $locale,
                    'label' => $translation['native_name'],
                ];
            }
        }

        return $items;
    }
}
