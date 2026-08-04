<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig\TokenParser;

use Genesis\Component\Twig\Node\TwigNodeScripts;
use Twig\Error\SyntaxError;
use Twig\Node\Expression\ArrayExpression;
use Twig\Node\Expression\ConstantExpression;
use Twig\Node\Node;
use Twig\Token;
use Twig\TokenParser\AbstractTokenParser;

/**
 * Adds javascript / style assets to head/footer/custom location.
 *
 * {% assets in 'head' with { priority: 2 } %}
 *   <script type="text/javascript" src="{{ url('genesis-theme://js/my.js') }}"></script>
 *   <link rel="stylesheet" href="{{ url('genesis-assets://css/font-awesome.min.css') }}" type="text/css"/>
 * {% endassets -%}
 */
class TokenParserAssets extends AbstractTokenParser
{
    /**
     * Parses a token and returns a node.
     *
     * @param Token $token A Twig Token instance
     * @return Node A Twig Node instance
     * @throws SyntaxError
     */
    public function parse(Token $token)
    {
        $lineno = $token->getLine();
        $stream = $this->parser->getStream();

        list($location, $variables) = $this->parseArguments($token);

        $content = $this->parser->subparse([$this, 'decideBlockEnd'], true);
        $stream->expect(Token::BLOCK_END_TYPE);

        return new TwigNodeScripts($content, $location, $variables, $lineno, $this->getTag());
    }

    /**
     * @param Token $token
     * @return array
     * @throws SyntaxError
     */
    protected function parseArguments(Token $token)
    {
        $stream = $this->parser->getStream();
        $location = null;
        if ($stream->nextIf(Token::OPERATOR_TYPE, 'in')) {
            $location = $this->parser->getExpressionParser()->parseExpression();
        } else {
            $lineno = $token->getLine();
            $location = new ConstantExpression('head', $lineno);
        }

        if ($stream->nextIf(Token::NAME_TYPE, 'with')) {
            $variables = $this->parser->getExpressionParser()->parseExpression();
        } else {
            $lineno = $token->getLine();
            $variables = new ArrayExpression([], $lineno);
            $variables->setAttribute('priority', 0);
        }
        $stream->expect(Token::BLOCK_END_TYPE);

        return [$location, $variables];
    }

    /**
     * @param Token $token
     * @return bool
     */
    public function decideBlockEnd(Token $token)
    {
        return $token->test('endassets');
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag()
    {
        return 'assets';
    }
}
