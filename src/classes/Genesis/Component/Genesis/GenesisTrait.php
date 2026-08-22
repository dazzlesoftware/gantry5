<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Genesis;

use Genesis\Framework\Genesis;

/**
 * Trait GenesisTrait
 * @package Genesis\Component\Genesis
 */
trait GenesisTrait
{
    /** @var Genesis */
    private static ?Genesis $genesis = null;

    /**
     * Get global Genesis instance.
     *
     * @return Genesis
     */
    public static function Genesis(): Genesis
    {
        // We cannot set variable directly for the trait as it doesn't work in HHVM.
        if (!self::$genesis) {
            self::$genesis = Genesis::instance();
        }

        return self::$genesis;
    }
}
