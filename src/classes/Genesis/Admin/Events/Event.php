<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Events;

use Genesis\Component\Event\Event as BaseEvent;
use Genesis\Component\Controller\RestfulControllerInterface;
use Genesis\Framework\Genesis;

/**
 * Class AssigmentsEvent
 * @package Genesis\Admin\Events
 */
class Event extends BaseEvent
{
 /**
     * Permanent fix for PHP 8.2 dynamic property warning:
     * Creation of dynamic property Event::$types is deprecated.
     */
    public array $types = [];

    /** @var Genesis */
    public Genesis $genesis;
    /** @var RestfulControllerInterface */
    public RestfulControllerInterface $controller;
    /** @var array */
    public array $data = [];
}
