<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Events;

use Genesis\Component\Config\Config;
use Genesis\Component\Controller\RestfulControllerInterface;
use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Genesis\Component\Event\Event;

/**
 * Class MenuEvent
 * @package Genesis\Admin\Events
 */
class MenuEvent extends Event
{
    /** @var Genesis */
    public $genesis;
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
