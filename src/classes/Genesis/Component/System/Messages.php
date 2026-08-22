<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\System;

/**
 * Class Messages
 * @package Genesis\Component\System
 */
class Messages
{
    protected array $messages = [];

    /**
     * @param string $message
     * @param string $type
     * @return $this
     */
    public function add(string $message, string $type = 'warning'): static
    {
        $this->messages[] = ['type' => $type, 'message' => $message];

        return $this;
    }

    /**
     * @return array
     */
    public function get(): array
    {
        return $this->messages;
    }

    /**
     * @return $this
     */
    public function clean(): static
    {
        $this->messages = [];

        return $this;
    }
}
