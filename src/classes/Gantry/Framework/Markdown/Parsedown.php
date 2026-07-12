<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework\Markdown;

/**
 * Class Parsedown
 * @package Gantry\Framework\Markdown
 */
class Parsedown extends \Parsedown
{
    use ParsedownTrait;

    /**
     * Parsedown constructor.
     *
     * @param array|null $defaults
     */
    public function __construct(?array $defaults = null)
    {
        $this->init($defaults ?: []);
    }

}
