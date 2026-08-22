<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Collection;

use DazzleSoftware\Toolbox\ArrayTraits\ArrayAccess;
use DazzleSoftware\Toolbox\ArrayTraits\Countable;
use DazzleSoftware\Toolbox\ArrayTraits\Export;

/**
 * Class Collection
 * @package Genesis\Component\Collection
 */
class Collection implements CollectionInterface
{
    use ArrayAccess, Countable, Export;

    /** @var array */
    protected array $items = [];

    /**
     * @param array $variables
     * @return Collection
     */
    public static function __set_state(array $variables): static
    {
        $instance = new static();
        $instance->items = $variables['items'];
        return $instance;
    }

    /**
     *
     * Create a copy of this collection.
     *
     * @return static
     */
    public function copy(): static
    {
        return clone $this;
    }

    /**
     * @param mixed $item
     * @return $this
     */
    public function add(mixed $item): static
    {
        $this->items[] = $item;

        return $this;
    }

    /**
     * @return \ArrayIterator
     */
    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->items);
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

    public function count(): int
    {
        return count($this->items);
    }

    public function toArray(): array
    {
        return $this->items;
    }
}
