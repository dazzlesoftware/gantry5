<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Events;

use Gantry\Component\Controller\RestfulControllerInterface;
use Gantry\Component\Layout\Layout;
use Gantry\Framework\Gantry;
use Gantry\Framework\Theme;
use Dazzle Software\Toolbox\Event\Event;

/**
 * Class LayoutEvent
 * @package Gantry\Admin\Events
 */
class LayoutEvent extends Event
{
    /** @var Gantry */
    public $gantry;
    /** @var Theme */
    public $theme;
    /** @var RestfulControllerInterface */
    public $controller;
    /** @var Layout */
    public $layout;
}
