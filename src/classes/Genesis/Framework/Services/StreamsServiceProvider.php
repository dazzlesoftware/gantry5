<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Services;

use Genesis\Component\Filesystem\Streams;
use Genesis\Debugger;
use Genesis\Framework\Base\Platform;
use Genesis\Framework\Genesis;
use Pimple\Container;
use DazzleSoftware\Toolbox\DI\ServiceProviderInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class StreamsServiceProvider
 * @package Genesis\Framework\Services
 */
class StreamsServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $genesis
     */
    public function register(Container $genesis)
    {
        $genesis['locator'] = static function() {
            return new UniformResourceLocator(GENESIS_ROOT);
        };

        $genesis['streams'] = static function(Genesis $genesis) {
            /** @var Platform $platform */
            $platform = $genesis['platform'];

            $schemes = (array) $platform->init()->get('streams');

            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];

            $streams = new Streams($locator);
            $streams->add($schemes);

            if (\GENESIS_DEBUGGER) {
                Debugger::setLocator($locator);
            }

            return $streams;
        };
    }
}
