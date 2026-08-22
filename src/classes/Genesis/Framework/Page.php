<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

/**
 * Class Page
 * @package Genesis\Framework
 */
class Page extends Base\Page
{
    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = []): string
    {
        throw new \Exception('Please override class');
    }
}
