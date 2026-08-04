<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Event;

use ArrayAccess;
use Symfony\Contracts\EventDispatcher\Event as SymfonyEvent;

/**
 * Symfony event with Genesis's legacy array payload behavior.
 *
 * @implements ArrayAccess<string|int, mixed>
 */
class Event extends SymfonyEvent implements ArrayAccess
{
    /** @var array<string|int, mixed> */
    protected array $items = [];

    /**
     * @param array<string|int, mixed> $items
     */
    public function __construct(array $items = [])
    {
        $this->items = $items;
    }

    public function offsetExists(mixed $offset): bool
    {
        return isset($this->items[$offset]);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->items[$offset] ?? null;
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        if ($offset === null) {
            $this->items[] = $value;
            return;
        }

        $this->items[$offset] = $value;
    }

    public function offsetUnset(mixed $offset): void
    {
        unset($this->items[$offset]);
    }

    /**
     * @return array<string|int, mixed>
     */
    public function toArray(): array
    {
        return $this->items;
    }
}
