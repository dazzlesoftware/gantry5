<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Events;

use Genesis\Component\Controller\RestfulControllerInterface;
use Genesis\Framework\Assignments;
use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Genesis\Component\Event\Event;

/**
 * Class AssigmentsEvent
 * @package Genesis\Admin\Events
 */
class AssigmentsEvent extends Event
{
    /** @var Genesis */
    public $genesis;
    /** @var Theme */
    public $theme;
    /** @var RestfulControllerInterface */
    public $controller;
    /** @var Assignments */
    public $assignments;
}
