<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Translator\Translator as BaseTranslator;

/**
 * Class Translator
 * @package Genesis\Framework
 */
class Translator extends BaseTranslator
{
    /**
     * @param string $string
     * @return string
     */
    public function translate(string $string, mixed ...$arguments): string
    {
        if (!\did_action('init')) {
            $translated = parent::translate($string);

            if ($arguments === []) {
                return $translated;
            }

            return sprintf($translated, ...$arguments);
        }

        static $textdomain;
        static $enginedomain;

        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];

        if (null === $textdomain) {
            $textdomain = $theme->details()->get('configuration.theme.textdomain', false);
            $enginedomain = $theme->details()->get('configuration.genesis.engine', 'nucleus');
        }

        // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
        $translated = $textdomain ? \__($string, $textdomain) : $string;

        if ($translated === $string) {
            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
            $translated = \__($string, $enginedomain);
        }

        if ($translated === $string) {
            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Runtime translation text is intentional.
            $translated = \__($string, 'genesis');
        }

        if ($translated === $string) {
            // Create WP compatible translation string.
            $string = parent::translate($string);

            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
            $translated = $textdomain ? \__($string, $textdomain) : $string;
            if ($translated === $string) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Runtime translation text is intentional.
                $translated = \__($string, 'genesis');
            }
        }

        if ($arguments === []) {
            return $translated;
        }

        return sprintf($translated, ...$arguments);
    }
}
