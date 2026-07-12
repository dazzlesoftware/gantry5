<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Twig\Node;

use LogicException;
use Twig\Compiler;
use Twig\Node\Node;

/**
 * Class TwigNodeTryCatch
 * @package Gantry\Component\Twig\Node
 */
class TwigNodeTryCatch extends Node
{
    /**
     * TwigNodeTryCatch constructor.
     * @param Node $try
     * @param Node|null $catch
     * @param int $lineno
     * @param string|null $tag
     */
    public function __construct(Node $try, ?Node $catch = null, $lineno = 0, $tag = null)
    {
        $nodes = ['try' => $try, 'catch' => $catch];
        $nodes = array_filter($nodes);

        parent::__construct($nodes, [], $lineno, $tag);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Compiler $compiler A Twig Compiler instance
     * @return void
     * @throws LogicException
     */
    public function compile(Compiler $compiler)
    {
        $compiler->addDebugInfo($this);

        $compiler->write('try {');

        $compiler
            ->indent()
            ->subcompile($this->getNode('try'))
            ->outdent()
            ->write('} catch (\Exception $e) {' . "\n")
            ->indent()
            ->write('if ($context[\'gantry\']->debug()) throw $e;' . "\n")
            ->write('if (\GANTRY_DEBUGGER) \Gantry\Debugger::addException($e);' . "\n")
            ->write('$context[\'e\'] = $e;' . "\n");

        if ($this->hasNode('catch')) {
            $compiler->subcompile($this->getNode('catch'));
        }

        $compiler
            ->outdent()
            ->write("}\n");
    }
}
