<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Serializable;

/**
 * Serializable trait
 *
 * Adds backwards compatibility to PHP 5/7 Serializable interface.
 *
 * Note: Remember to add: `implements \Serializable` to the classes which use this trait.
 */
trait Serializable
{
    /**
     * @return string
     */
    #[\ReturnTypeWillChange]
    final public function serialize()
    {
        return serialize($this->__serialize());
    }

    /**
     * @param string $serialized
     * @return void
     */
    #[\ReturnTypeWillChange]
    final public function unserialize($serialized)
    {
        $this->__unserialize(unserialize($serialized, ['allowed_classes' => $this->getUnserializeAllowedClasses()]));
    }

    /**
     * @return array|bool
     */
    protected function getUnserializeAllowedClasses()
    {
        return false;
    }
}
