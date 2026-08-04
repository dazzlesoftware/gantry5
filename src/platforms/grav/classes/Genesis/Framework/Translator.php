<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Translator\Translator as BaseTranslator;
use Grav\Common\Grav;
use Grav\Common\Language\Language;

/**
 * Class Translator
 * @package Genesis\Framework
 */
class Translator extends BaseTranslator
{
    public function __construct()
    {
        /** @var Language $language */
        $language = Grav::instance()['language'];

        if ($language->enabled()) {
            $this->active($language->getLanguage());
        }
    }
}
