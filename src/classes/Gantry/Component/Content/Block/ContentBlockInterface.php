<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Content\Block;

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
    public static function create($id = null);

    /**
     * @param array $serialized
     * @return ContentBlockInterface
     * @since 5.4.3
     */
    public static function fromArray(array $serialized);

    /**
     * Block constructor.
     *
     * @param string $id
     * @since 5.4.3
     */
    public function __construct($id = null);

    /**
     * @return string
     * @since 5.4.3
     */
    public function getId();

    /**
     * @return string
     * @since 5.4.3
     */
    public function getToken();

    /**
     * @return array
     * @since 5.4.3
     */
    public function toArray();

    /**
     * @param array $serialized
     * @since 5.4.3
     */
    public function build(array $serialized);

    /**
     * @param string $content
     * @return $this
     * @since 5.4.3
     */
    public function setContent($content);

    /**
     * @param ContentBlockInterface $block
     * @return $this
     * @since 5.4.3
     */
    public function addBlock(ContentBlockInterface $block);

    /**
     * @return string
     */
    public function toString();
}
