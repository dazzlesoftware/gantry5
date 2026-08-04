<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Gantry;

use Gantry\Framework\Gantry;

/**
 * Trait GantryTrait
 * @package Gantry\Component\Gantry
 */
trait GantryTrait
{
    /** @var Genesis */
    private static $gantry;

    /**
     * Get global Genesis instance.
     *
     * @return Genesis
     */
    public static function Genesis()
    {
        // We cannot set variable directly for the trait as it doesn't work in HHVM.
        if (!self::$gantry) {
            self::$gantry = Gantry::instance();
        }

        return self::$gantry;
    }
}
