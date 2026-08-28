<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig\TokenParser;

use Twig\Token;

/**
 * Adds stylesheets to document.
 *
 * {% styles with { priority: 2 } %}
 *   <link rel="stylesheet" href="{{ url('genesis-assets://css/font-awesome7-all.min.css') }}" type="text/css"/>
 * {% endstyles -%}
 */
class TokenParserStyles extends TokenParserAssets
{
    /**
     * @param Token $token
     * @return bool
     */
    public function decideBlockEnd(Token $token): bool
    {
        return $token->test('endstyles');
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag(): string
    {
        return 'styles';
    }
}
