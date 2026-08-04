<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Translator\Translator as BaseTranslator;
use Genesis\phpBB\Runtime;

/**
 * Class Translator
 * @package Genesis\Framework
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
