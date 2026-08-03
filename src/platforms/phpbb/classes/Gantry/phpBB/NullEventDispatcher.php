<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\phpBB;

/**
 * Stand-in for Gantry's internal `events` service (normally a real
 * Symfony\Component\EventDispatcher\EventDispatcher).
 *
 * phpBB's own bootstrap loads its own (ancient, v3.4, old-argument-order) copy of
 * Symfony\Component\EventDispatcher\EventDispatcher long before any Gantry code runs, so no
 * matter which copy our own composer autoload maps to that class name, phpBB's copy is always
 * the one actually in memory by the time we'd instantiate one -- with an incompatible dispatch()
 * signature. Nothing on the phpBB platform currently subscribes to Gantry's own internal events
 * (Gantry\Admin\EventListener, used by other platforms to react to admin.*.save events, has no
 * phpBB equivalent yet), so a no-op dispatcher is a safe stand-in for now.
 */
class NullEventDispatcher
{
    /**
     * @param object $event
     * @param string|null $eventName
     * @return object
     */
    public function dispatch($event, $eventName = null)
    {
        return $event;
    }

    /**
     * @param object $subscriber
     * @return void
     */
    public function addSubscriber($subscriber)
    {
    }

    /**
     * @param string $eventName
     * @param callable $listener
     * @param int $priority
     * @return void
     */
    public function addListener($eventName, $listener, $priority = 0)
    {
    }
}
