<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Events;

use Genesis\Admin\Theme;
use Genesis\Framework\Genesis;
use Genesis\Component\Event\Event;

/**
 * Class AssigmentsEvent
 * @package Genesis\Admin\Events
 */
class InitThemeEvent extends Event
{
    /** @var Genesis */
    public $genesis;
    /** @var Theme */
    public $theme;
}
