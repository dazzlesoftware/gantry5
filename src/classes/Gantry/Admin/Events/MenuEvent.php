<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Events;

use Gantry\Component\Config\Config;
use Gantry\Component\Controller\RestfulControllerInterface;
use Gantry\Framework\Gantry;
use Gantry\Framework\Theme;
use Gantry\Component\Event\Event;

/**
 * Class MenuEvent
 * @package Gantry\Admin\Events
 */
class MenuEvent extends Event
{
    /** @var Gantry */
    public $gantry;
    /** @var Theme */
    public $theme;
    /** @var RestfulControllerInterface */
    public $controller;
    /** @var string */
    public $resource;
    /** @var Config */
    public $menu;
    /** @var bool */
    public $save = true;
    /** @var bool */
    public $delete = false;
    /** @var array|null */
    public $debug;
}
