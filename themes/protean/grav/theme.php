<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Grav\Theme;

use Gantry\Framework\Gantry;
use Gantry\Framework\Theme as GantryTheme;
use Grav\Common\Theme;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

class G5_Protean extends Theme
{
    public $gantry = '5.5';
    protected $theme;

    public static function getSubscribedEvents()
    {
        return ['onThemeInitialized' => ['onThemeInitialized', 0]];
    }

    public function onThemeInitialized()
    {
        if (defined('GRAV_CLI') && GRAV_CLI) {
            return;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];
        $path = $locator('theme://');
        $name = $this->name;

        if (!class_exists('\Gantry5\Loader')) {
            if ($this->isAdmin()) {
                $this->grav['messages']->add('Please enable Genesis plugin in order to use current theme!', 'error');
                return;
            }
            throw new \LogicException('Please install and enable Genesis Framework plugin!');
        }

        \Gantry5\Loader::setup();
        $gantry = Gantry::instance();
        $gantry['theme.path'] = $path;
        $gantry['theme.name'] = $name;
        require $locator('theme://includes/theme.php');
        $gantry['theme'] = static function ($c) {
            return new \Gantry\Theme\G5_Protean($c['theme.path'], $c['theme.name']);
        };
    }
}
