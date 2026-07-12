<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Twig\Node;

use Twig\Compiler;
use Twig\Node\Expression\AbstractExpression;
use Twig\Node\Node;
use Twig\Node\NodeCaptureInterface;

/**
 * Class TwigNodeAssets
 * @package Gantry\Component\Twig\Node
 */
class TwigNodeAssets extends Node implements NodeCaptureInterface
{
    protected $tagName = 'assets';

    /**
     * TwigNodeAssets constructor.
     * @param Node|null $body
     * @param AbstractExpression|null $location
     * @param AbstractExpression|null $variables
     * @param int $lineno
     * @param string|null $tag
     */
    public function __construct(?Node $body = null, ?AbstractExpression $location = null, ?AbstractExpression $variables = null, $lineno = 0, $tag = null)
    {
        parent::__construct(['body' => $body, 'location' => $location, 'variables' => $variables], [], $lineno, $tag);
    }
    /**
     * Compiles the node to PHP.
     *
     * @param Compiler $compiler A Twig Compiler instance
     */
    public function compile(Compiler $compiler)
    {
        $compiler->addDebugInfo($this)
            ->write("\$assetFunction = \$this->env->getFunction('parse_assets')->getCallable();\n")
            ->write('$assetVariables = ')
            ->subcompile($this->getNode('variables'))
            ->raw(";\n")
            ->write("if (\$assetVariables && !is_array(\$assetVariables)) {\n")
            ->indent()
            ->write("throw new UnexpectedValueException('{% {$this->tagName} with x %}: x is not an array');\n")
            ->outdent()
            ->write("}\n")
            ->write('$location = ')
            ->subcompile($this->getNode('location'))
            ->raw(";\n")
            ->write("if (\$location && !is_string(\$location)) {\n")
            ->indent()
            ->write("throw new UnexpectedValueException('{% {$this->tagName} in x %}: x is not a string');\n")
            ->outdent()
            ->write("}\n")
            ->write("\$priority = isset(\$assetVariables['priority']) ? \$assetVariables['priority'] : 0;\n")
            ->write("ob_start();\n")
            ->subcompile($this->getNode('body'))
            ->write("\$content = ob_get_clean();\n")
            ->write("\$assetFunction(\$content, \$location, \$priority);\n");
    }
}
