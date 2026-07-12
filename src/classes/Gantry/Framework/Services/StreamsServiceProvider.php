<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework\Services;

use Gantry\Component\Filesystem\Streams;
use Gantry\Debugger;
use Gantry\Framework\Base\Platform;
use Gantry\Framework\Gantry;
use Pimple\Container;
use DazzleSoftware\Toolbox\DI\ServiceProviderInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class StreamsServiceProvider
 * @package Gantry\Framework\Services
 */
class StreamsServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $gantry
     */
    public function register(Container $gantry)
    {
        $gantry['locator'] = static function() {
            return new UniformResourceLocator(GANTRY5_ROOT);
        };

        $gantry['streams'] = static function(Gantry $gantry) {
            /** @var Platform $platform */
            $platform = $gantry['platform'];

            $schemes = (array) $platform->init()->get('streams');

            /** @var UniformResourceLocator $locator */
            $locator = $gantry['locator'];

            $streams = new Streams($locator);
            $streams->add($schemes);

            if (\GANTRY_DEBUGGER) {
                Debugger::setLocator($locator);
            }

            return $streams;
        };
    }
}
