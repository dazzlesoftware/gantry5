<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Serializable;

/**
 * Serializable trait
 *
 * Bridges PHP's legacy Serializable interface to the modern serialization methods.
 *
 * Note: Remember to add: `implements \Serializable` to the classes which use this trait.
 */
trait Serializable
{
    /**
     * @return string
     */
    final public function serialize(): string
    {
        return serialize($this->__serialize());
    }

    /**
     * @param string $serialized
     * @return void
     */
    final public function unserialize(string $serialized): void
    {
        $this->__unserialize(unserialize($serialized, ['allowed_classes' => $this->getUnserializeAllowedClasses()]));
    }

    /**
     * @return array|bool
     */
    protected function getUnserializeAllowedClasses(): array|bool
    {
        return false;
    }
}
