<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Translator\Translator as BaseTranslator;
use Joomla\CMS\Language\Text;

/**
 * Class Translator
 * @package Genesis\Framework
 */
class Translator extends BaseTranslator
{
    /**
     * @param string $string
     * @return string
     */
    public function translate($string)
    {
        if (\func_num_args() === 1) {
            return Text::_($string);
        }

        $args = \func_get_args();

        return Text::sprintf(...$args);
    }
}
