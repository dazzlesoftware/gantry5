<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework\Markdown;

/**
 * Class ParsedownExtra
 * @package Gantry\Framework\Markdown
 */
class ParsedownExtra extends \ParsedownExtra
{
    use ParsedownTrait;

    /**
     * ParsedownExtra constructor.
     *
     * @param array|null $defaults
     * @throws \Exception
     */
    public function __construct(?array $defaults = null)
    {
        parent::__construct();

        $this->init($defaults ?: []);
    }
}
