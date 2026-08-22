<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig\Node;

use Twig\Compiler;
use Twig\Node\Node;

/**
 * Class TwigNodeThrow
 * @package Genesis\Component\Twig\Node
 */
class TwigNodeThrow extends Node
{
    /**
     * TwigNodeThrow constructor.
     * @param int $code
     * @param Node $message
     * @param int $lineno
     * @param string|null $tag
     */
    public function __construct(
        int $code,
        Node $message,
        int $lineno = 0,
        ?string $tag = null
    ) {
        parent::__construct(['message' => $message], ['code' => $code], $lineno, $tag);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Compiler $compiler A Twig Compiler instance
     * @throws \LogicException
     */
    public function compile(Compiler $compiler): void
    {
        $compiler->addDebugInfo($this);

        $compiler
            ->write('throw new \RuntimeException(')
            ->subcompile($this->getNode('message'))
            ->write(', ')
            ->write($this->getAttribute('code') ?: 500)
            ->write(");\n");
    }
}
