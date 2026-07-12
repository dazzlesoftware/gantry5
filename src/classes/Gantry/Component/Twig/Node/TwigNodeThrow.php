<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Twig\Node;

use Twig\Compiler;
use Twig\Node\Node;

/**
 * Class TwigNodeThrow
 * @package Gantry\Component\Twig\Node
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
        $code,
        Node $message,
        $lineno = 0,
        $tag = null
    ) {
        parent::__construct(['message' => $message], ['code' => $code], $lineno, $tag);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Compiler $compiler A Twig Compiler instance
     * @throws \LogicException
     */
    public function compile(Compiler $compiler)
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
