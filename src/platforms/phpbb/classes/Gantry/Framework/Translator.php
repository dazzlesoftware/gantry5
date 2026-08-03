<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Translator\Translator as BaseTranslator;
use Gantry\phpBB\Runtime;

/**
 * Class Translator
 * @package Gantry\Framework
 */
class Translator extends BaseTranslator
{
    public function __construct()
    {
        if (Runtime::isBooted()) {
            /** @var \phpbb\language\language $language */
            $language = Runtime::service('language');

            $this->active(substr($language->get_used_language(), 0, 2) ?: 'en');
        }
    }
}
