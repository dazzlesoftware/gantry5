<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Events;

use Gantry\Admin\Theme;
use Gantry\Framework\Gantry;
use Dazzle Software\Toolbox\Event\Event;

/**
 * Class AssigmentsEvent
 * @package Gantry\Admin\Events
 */
class InitThemeEvent extends Event
{
    /** @var Gantry */
    public $gantry;
    /** @var Theme */
    public $theme;
}
