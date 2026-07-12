<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Translator\Translator as BaseTranslator;

/**
 * Class Translator
 * @package Gantry\Framework
 */
class Translator extends BaseTranslator
{
    /**
     * @param string $string
     * @return string
     */
    public function translate($string)
    {
        if (!\did_action('init')) {
            $translated = parent::translate($string);

            if (\func_num_args() === 1) {
                return $translated;
            }

            $args = \func_get_args();
            $args[0] = $translated;

            return sprintf(...$args);
        }

        static $textdomain;
        static $enginedomain;

        /** @var Theme $theme */
        $theme = Gantry::instance()['theme'];

        if (null === $textdomain) {
            $textdomain = $theme->details()->get('configuration.theme.textdomain', false);
            $enginedomain = $theme->details()->get('configuration.gantry.engine', 'nucleus');
        }

        // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
        $translated = $textdomain ? \__($string, $textdomain) : $string;

        if ($translated === $string) {
            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
            $translated = \__($string, $enginedomain);
        }

        if ($translated === $string) {
            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Runtime translation text is intentional.
            $translated = \__($string, 'gantry5');
        }

        if ($translated === $string) {
            // Create WP compatible translation string.
            $string = parent::translate($string);

            // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText,WordPress.WP.I18n.NonSingularStringLiteralDomain -- Runtime translation values are intentional.
            $translated = $textdomain ? \__($string, $textdomain) : $string;
            if ($translated === $string) {
                // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Runtime translation text is intentional.
                $translated = \__($string, 'gantry5');
            }
        }

        if (\func_num_args() === 1) {
            return $translated;
        }

        $args = \func_get_args();
        $args[0] = $translated;

        return sprintf(...$args);
    }
}
