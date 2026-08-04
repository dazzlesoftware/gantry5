<?php

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
    protected $items = [];

    /**
     * @param array $variables
     * @return Collection
     */
    public static function __set_state($variables)
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
    public function copy()
    {
        return clone $this;
    }

    /**
     * @param mixed $item
     * @return $this
     */
    public function add($item)
    {
        $this->items[] = $item;

        return $this;
    }

    /**
     * @return \ArrayIterator
     */
    #[\ReturnTypeWillChange]
    public function getIterator()
    {
        return new \ArrayIterator($this->items);
    }
}
