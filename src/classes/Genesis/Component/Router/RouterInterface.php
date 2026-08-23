<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Router;

use Genesis\Component\Response\Response;
use Psr\Http\Message\ResponseInterface;

/**
 * Interface RouterInterface
 * @package Genesis\Component\Router
 */
interface RouterInterface
{
    public function dispatch(): ResponseInterface|Response|bool|null;
}
