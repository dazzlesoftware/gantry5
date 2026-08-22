<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\MultiLanguage;

/**
 * Class PolyLang
 * @package Genesis\WordPress\MultiLanguage
 */
class PolyLang extends WordPress
{
    /**
     * @return bool
     */
    public static function enabled(): bool
    {
        return function_exists('pll_current_language') && function_exists('pll_the_languages');
    }

    /*
    public function getCurrentLanguage()
    {
        return pll_current_language('slug');
    }

    public function getLanguageOptions()
    {
        $languages = pll_the_languages(['raw' => 1]);

        $items = [];
        foreach ($languages as $item) {
            $items[] = [
                'name' => $item['slug'],
                'label' => $item['name'],
            ];
        }

        return $items;
    }
    */
}
