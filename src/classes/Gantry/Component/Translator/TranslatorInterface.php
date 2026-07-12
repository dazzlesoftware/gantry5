<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Translator;

/**
 * Interface TranslatorInterface
 * @package Gantry\Component\Translator
 */
interface TranslatorInterface
{
    /**
     * @param string $string
     * @return string
     */
    public function translate($string);

    /**
     * Set new active language if given and return previous active language.
     *
     * @param  string  $language  Language code. If not given, current language is kept.
     * @return string  Previously active language.
     */
    public function active($language = null);
}
