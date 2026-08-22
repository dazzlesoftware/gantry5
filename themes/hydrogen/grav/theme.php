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
use DazzleSoftware\Toolbox\Session\Message;

/**
 * Class Genesis_Hydrogen
 * @package Grav\Theme
 */
class Genesis_Hydrogen extends Theme
{
    /** @var string */
    public $genesis = '5.5';
    /** @var GenesisTheme */
    protected $theme;

    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0]
        ];
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

        if (!class_exists('\Genesis\Loader')) {
            if ($this->isAdmin()) {
                /** @var Message $messages */
                $messages = $this->grav['messages'];
                $messages->add('Please enable Genesis plugin in order to use current theme!', 'error');

                return;
            }

            throw new \LogicException('Please install and enable Genesis Framework plugin!');
        }

        // Setup Genesis Framework or throw exception.
        \Genesis\Loader::setup();

        // Get Genesis instance.
        $genesis = Genesis::instance();

        // Set the theme path from Grav variable.
        $genesis['theme.path'] = $path;
        $genesis['theme.name'] = $name;

        // Define the template.
        require $locator('theme://includes/theme.php');

        // Define Genesis services.
        $genesis['theme'] = static function ($c) {
            return new \Genesis\Theme\Genesis_Hydrogen($c['theme.path'], $c['theme.name']);
        };
    }
}
