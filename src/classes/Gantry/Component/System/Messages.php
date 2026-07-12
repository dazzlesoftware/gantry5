<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\System;

/**
 * Class Messages
 * @package Gantry\Component\System
 */
class Messages
{
    protected $messages = [];

    /**
     * @param string $message
     * @param string $type
     * @return $this
     */
    public function add($message, $type = 'warning')
    {
        $this->messages[] = ['type' => $type, 'message' => $message];

        return $this;
    }

    /**
     * @return array
     */
    public function get()
    {
        return $this->messages;
    }

    /**
     * @return $this
     */
    public function clean()
    {
        $this->messages = [];

        return $this;
    }
}
