<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig\TokenParser;

use Genesis\Component\Twig\Node\TwigNodePageblock;
use Twig\Error\SyntaxError;
use Twig\Node\Expression\ArrayExpression;
use Twig\Node\Expression\ConstantExpression;
use Twig\Node\Node;
use Twig\Token;
use Twig\TokenParser\AbstractTokenParser;

/**
 * Adds javascript / style assets to head/footer/custom location.
 *
 * {% pageblock in 'bottom' with { priority: 0 } %}
 *   <div>Bottom HTML</div>
 * {% endpageblock -%}
 */
class TokenParserPageblock extends AbstractTokenParser
{
    /**
     * Parses a token and returns a node.
     *
     * @param Token $token A Twig Token instance
     * @return Node A Twig Node instance
     * @throws SyntaxError
     */
    public function parse(Token $token): Node
    {
        $lineno = $token->getLine();
        $stream = $this->parser->getStream();

        list($location, $variables) = $this->parseArguments($token);

        $content = $this->parser->subparse([$this, 'decideBlockEnd'], true);
        $stream->expect(Token::BLOCK_END_TYPE);

        return new TwigNodePageblock($content, $location, $variables, $lineno, $this->getTag());
    }

    /**
     * @param Token $token
     * @return array
     * @throws SyntaxError
     */
    protected function parseArguments(Token $token): array
    {
        $stream = $this->parser->getStream();
        $lineno = $token->getLine();
        $location = new ConstantExpression($stream->expect(Token::NAME_TYPE)->getValue(), $lineno);

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
    public function decideBlockEnd(Token $token): bool
    {
        return $token->test('endpageblock');
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag(): string
    {
        return 'pageblock';
    }
}
