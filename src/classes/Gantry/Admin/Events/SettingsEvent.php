<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Events;

use Gantry\Component\Controller\RestfulControllerInterface;
use Gantry\Framework\Gantry;
use Gantry\Framework\Theme;
use Dazzle Software\Toolbox\Event\Event;

/**
 * Class SettingsEvent
 * @package Gantry\Admin\Events
 */
class SettingsEvent extends Event
{
    /** @var Gantry */
    public $gantry;
    /** @var Theme */
    public $theme;
    /** @var RestfulControllerInterface */
    public $controller;
    /** @var array */
    public $data;
}
