<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework\Services;

use Grav\Common\Grav;
use Pimple\Container;
use Pimple\ServiceProviderInterface;

/**
 * Class ErrorServiceProvider
 * @package Gantry\Framework\Services
 */
class ErrorServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $container
     */
    public function register(Container $container)
    {
        $grav = Grav::instance();

        $container['errors'] = $grav['errors'];
    }
}
