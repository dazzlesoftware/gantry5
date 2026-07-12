<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\WordPress\MultiLanguage;

/**
 * Interface MultiLantuageInterface
 * @package Gantry\WordPress\MultiLanguage
 */
interface MultiLantuageInterface
{
    /**
     * @return bool
     */
    public static function enabled();

    /**
     * @return string
     */
    public function getCurrentLanguage();

    /**
     * @return array
     */
    public function getLanguageOptions();
}
