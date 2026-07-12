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

/**
 * Class AssigmentsEvent
 * @package Gantry\Admin\Events
 */
class Event extends \RocketTheme\Toolbox\Event\Event
{
 /**
     * Permanent fix for PHP 8.2 dynamic property warning:
     * Creation of dynamic property Event::$types is deprecated.
     */
    public array $types = [];

    /** @var Gantry */
    public $gantry;
    /** @var RestfulControllerInterface */
    public $controller;
    /** @var array */
    public $data;
}
