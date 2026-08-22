<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Collection;

/**
 * Interface CollectionInterface
 * @package Genesis\Component\Collection
 */
interface CollectionInterface extends \IteratorAggregate, \ArrayAccess, \Countable
{
    /**
     * @return array
     */
    public function toArray(): array;

    /**
     * @param mixed $item
     */
    public function add(mixed $item): static;

    /**
     * @return \ArrayIterator
     */
    public function getIterator(): \Traversable;

    /**
     * @param string|int $offset
     * @return bool
     */
    public function offsetExists(mixed $offset): bool;

    /**
     * @param string|int $offset
     * @param mixed $value
     */
    public function offsetSet(mixed $offset, mixed $value): void;

    /**
     * @param string|int $offset
     * @return mixed
     */
    public function offsetGet(mixed $offset): mixed;

    /**
     * @param string|int $offset
     */
    public function offsetUnset(mixed $offset): void;

    /**
     * @return int
     */
    public function count(): int;
}
