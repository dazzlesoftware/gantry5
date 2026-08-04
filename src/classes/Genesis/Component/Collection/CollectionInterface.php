<?php

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
    public function toArray();

    /**
     * @param mixed $item
     */
    public function add($item);

    /**
     * @return \ArrayIterator
     */
    #[\ReturnTypeWillChange]
    public function getIterator();

    /**
     * @param string|int $offset
     * @return bool
     */
    #[\ReturnTypeWillChange]
    public function offsetExists($offset);

    /**
     * @param string|int $offset
     * @param mixed $value
     */
    #[\ReturnTypeWillChange]
    public function offsetSet($offset, $value);

    /**
     * @param string|int $offset
     * @return mixed
     */
    #[\ReturnTypeWillChange]
    public function offsetGet($offset);

    /**
     * @param string|int $offset
     */
    #[\ReturnTypeWillChange]
    public function offsetUnset($offset);

    /**
     * @return int
     */
    #[\ReturnTypeWillChange]
    public function count();
}
