<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Router;

/**
 * Interface RouterInterface
 * @package Genesis\Component\Router
 */
interface RouterInterface
{
    public function dispatch(): bool;
}
