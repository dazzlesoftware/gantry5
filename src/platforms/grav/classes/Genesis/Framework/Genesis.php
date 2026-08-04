<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Grav\Common\Config\Config;
use Grav\Common\Grav;

/**
 * Class Genesis
 * @package Genesis\Framework
 */
class Genesis extends Base\Genesis
{
    /**
     * @throws \LogicException
     */
    protected static function init()
    {
        $container = parent::init();

        // Keep Genesis on DazzleSoftware Toolbox while importing Grav's stream
        // configuration through the locator's public, implementation-neutral API.
        $container['locator'] = static function() {
            $gravLocator = Grav::instance()['locator'];
            $locator = new UniformResourceLocator(ROOT_DIR);

            foreach ($gravLocator->getPaths() as $scheme => $prefixes) {
                foreach ($prefixes as $prefix => $paths) {
                    $locator->addPath($scheme, $prefix, $paths, false, true);
                }
            }

            return $locator;
        };

        return $container;
    }

    /**
     * @return array
     */
    protected function loadGlobal()
    {
        $grav = Grav::instance();

        /** @var Config $config */
        $config = $grav['config'];

        return (array) $config->get('plugins.genesis');
    }
}
