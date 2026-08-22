<?php

declare(strict_types=1);

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
    public function translate(string $string, mixed ...$arguments): string
    {
        if (!$arguments) {
            return Text::_($string);
        }

        $args = [$string, ...$arguments];

        return Text::sprintf(...$args);
    }
}
