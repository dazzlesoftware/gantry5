<?php

declare(strict_types=1);

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
    public Genesis $genesis;
    /** @var Theme */
    public Theme $theme;
    /** @var RestfulControllerInterface */
    public RestfulControllerInterface $controller;
    /** @var string */
    public string $resource = '';
    /** @var Config */
    public Config $menu;
    /** @var bool */
    public bool $save = true;
    /** @var bool */
    public bool $delete = false;
    /** @var array|null */
    public ?array $debug = null;
}
