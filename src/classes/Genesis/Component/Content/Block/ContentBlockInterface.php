<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Content\Block;

/**
 * @since 5.4.3
 */
interface ContentBlockInterface extends \Serializable
{
    /**
     * @param string $id
     * @return static
     * @since 5.4.3
     */
    public static function create(?string $id = null): static;

    /**
     * @param array $serialized
     * @return ContentBlockInterface
     * @since 5.4.3
     */
    public static function fromArray(array $serialized): ContentBlockInterface;

    /**
     * Block constructor.
     *
     * @param string $id
     * @since 5.4.3
     */
    public function __construct(?string $id = null);

    /**
     * @return string
     * @since 5.4.3
     */
    public function getId(): string;

    /**
     * @return string
     * @since 5.4.3
     */
    public function getToken(): string;

    /**
     * @return array
     * @since 5.4.3
     */
    public function toArray(): array;

    /**
     * @param array $serialized
     * @since 5.4.3
     */
    public function build(array $serialized): void;

    /**
     * @param string $content
     * @return $this
     * @since 5.4.3
     */
    public function setContent(string $content): static;

    /**
     * @param ContentBlockInterface $block
     * @return $this
     * @since 5.4.3
     */
    public function addBlock(ContentBlockInterface $block): static;

    /**
     * @return string
     */
    public function toString(): string;
}
