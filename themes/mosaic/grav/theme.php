<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Grav\Theme;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme as GenesisTheme;
use Grav\Common\Theme;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

class Genesis_Mosaic extends Theme
{
    public string $genesis = '5.5';
    protected ?GenesisTheme $theme = null;

    public static function getSubscribedEvents(): array
    {
        return ['onThemeInitialized' => ['onThemeInitialized', 0]];
    }

    public function onThemeInitialized(): void
    {
        if (defined('GRAV_CLI') && GRAV_CLI) {
            return;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];
        $path = $locator('theme://');
        $name = $this->name;

        if (!class_exists('\Genesis\Loader')) {
            if ($this->isAdmin()) {
                $this->grav['messages']->add('Please enable the Genesis plugin in order to use the current theme!', 'error');
                return;
            }
            throw new \LogicException('Please install and enable the Genesis Framework plugin!');
        }

        \Genesis\Loader::setup();
        $genesis = Genesis::instance();
        $genesis['theme.path'] = $path;
        $genesis['theme.name'] = $name;
        require $locator('theme://includes/theme.php');
        $genesis['theme'] = static function ($c): GenesisTheme {
            return new \Genesis\Theme\Genesis_Mosaic($c['theme.path'], $c['theme.name']);
        };
    }
}
