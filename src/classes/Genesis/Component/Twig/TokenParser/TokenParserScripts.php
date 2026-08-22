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
 * Adds scripts to head/footer/custom location.
 *
 * {% scripts in 'head' with { priority: 2 } %}
 *   <script type="text/javascript" src="{{ url('genesis-theme://js/my.js') }}"></script>
 * {% endscripts -%}
 */
class TokenParserScripts extends TokenParserAssets
{
    /**
     * @param Token $token
     * @return bool
     */
    public function decideBlockEnd(Token $token): bool
    {
        return $token->test('endscripts');
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag(): string
    {
        return 'scripts';
    }
}
