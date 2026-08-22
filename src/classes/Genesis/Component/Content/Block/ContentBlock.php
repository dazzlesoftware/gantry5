<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Content\Block;

use Genesis\Component\Serializable\Serializable;

/**
 * Class to create nested blocks of content.
 *
 * $innerBlock = ContentBlock::create();
 * $innerBlock->setContent('my inner content');
 * $outerBlock = ContentBlock::create();
 * $outerBlock->setContent(sprintf('Inside my outer block I have %s.', $innerBlock->getToken()));
 * $outerBlock->addBlock($innerBlock);
 * echo $outerBlock;
 *
 * @package Genesis\Component\Content\Block
 * @since 5.4.3
 */
class ContentBlock implements ContentBlockInterface
{
    use Serializable;

    /** @var int */
    protected int $version = 1;
    /** @var string */
    protected string $id;
    /** @var string */
    protected string $tokenTemplate = '@@BLOCK-%s@@';
    /** @var string */
    protected string $content = '';
    /** @var ContentBlockInterface[] */
    protected array $blocks = [];

    /**
     * @param string $id
     * @return static
     * @since 5.4.3
     */
    public static function create(?string $id = null): static
    {
        return new static($id);
    }

    /**
     * @param array $serialized
     * @return ContentBlockInterface
     * @since 5.4.3
     */
    public static function fromArray(array $serialized): ContentBlockInterface
    {
        try {
            $type = isset($serialized['_type']) ? $serialized['_type'] : null;
            $id = isset($serialized['id']) ? $serialized['id'] : null;

            if (!$type || !$id || !is_subclass_of($type, ContentBlockInterface::class, true)) {
                throw new \RuntimeException('Bad data');
            }

            $instance = new $type($id);
            $instance->build($serialized);
        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf('Cannot unserialize Block: %s', $e->getMessage()), $e->getCode(), $e);
        }

        return $instance;
    }

    /**
     * Block constructor.
     *
     * @param string $id
     * @since 5.4.3
     */
    public function __construct(?string $id = null)
    {
        $this->id = $id ? (string) $id : $this->generateId();
    }

    /**
     * @return string
     * @since 5.4.3
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @return string
     * @since 5.4.3
     */
    public function getToken(): string
    {
        return sprintf($this->tokenTemplate, $this->getId());
    }

    /**
     * @return array
     * @since 5.4.3
     */
    public function toArray(): array
    {
        $blocks = [];
        foreach ($this->blocks as $block) {
            $blocks[$block->getId()] = $block->toArray();
        }

        $array = [
            '_type' => get_class($this),
            '_version' => $this->version,
            'id' => $this->id,
        ];

        if ($this->content) {
            $array['content'] = $this->content;
        }

        if ($blocks) {
            $array['blocks'] = $blocks;
        }

        return $array;
    }

    /**
     * @return string
     * @since 5.4.3
     */
    public function toString(): string
    {
        if (!$this->blocks) {
            return (string) $this->content;
        }

        $tokens = [];
        $replacements = [];
        foreach ($this->blocks as $block) {
            $tokens[] = $block->getToken();
            $replacements[] = $block->toString();
        }

        return str_replace($tokens, $replacements, (string) $this->content);
    }

    /**
     * @return string
     * @since 5.4.3
     */
    public function __toString(): string
    {
        try {
            return $this->toString();
        } catch (\Exception $e) {
            return sprintf('Error while rendering block: %s', $e->getMessage());
        }
    }

    /**
     * @param array $serialized
     * @since 5.4.3
     */
    public function build(array $serialized): void
    {
        $this->checkVersion($serialized);

        $this->id = isset($serialized['id']) ? (string) $serialized['id'] : $this->generateId();

        if (isset($serialized['content'])) {
            $this->setContent((string) $serialized['content']);
        }

        $blocks = isset($serialized['blocks']) ? (array) $serialized['blocks'] : [];
        foreach ($blocks as $block) {
            $this->addBlock(self::fromArray($block));
        }
    }

    /**
     * @param string $content
     * @return $this
     * @since 5.4.3
     */
    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    /**
     * @param ContentBlockInterface $block
     * @return $this
     * @since 5.4.3
     */
    public function addBlock(ContentBlockInterface $block): static
    {
        $this->blocks[$block->getId()] = $block;

        return $this;
    }

    /**
     * @return array
     * @since 5.4.3
     */
    public function __serialize(): array
    {
        return $this->toArray();
    }

    /**
     * @param array $serialized
     * @since 5.4.3
     */
    public function __unserialize(array $serialized): void
    {
        $this->build($serialized);
    }

    /**
     * @return string
     * @since 5.4.3
     */
    protected function generateId(): string
    {
        return uniqid('', true);
    }

    /**
     * @param array $serialized
     * @throws \RuntimeException
     * @since 5.4.3
     */
    protected function checkVersion(array $serialized): void
    {
        $version = isset($serialized['_version']) ? (int) $serialized['_version'] : 1;
        if ($version !== $this->version) {
            throw new \RuntimeException(sprintf('Unsupported version %s', $version));
        }
    }
}
