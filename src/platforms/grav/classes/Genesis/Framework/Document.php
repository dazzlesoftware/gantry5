<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Content\Document\HtmlDocument;
use Grav\Common\Assets;
use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\Language\Language;
use Grav\Common\Page\Pages;

/**
 * Class Document
 * @package Genesis\Framework
 */
class Document extends HtmlDocument
{
    public static function registerAssets(): void
    {
        static::registerFrameworks();
        static::registerStyles();
        static::registerScripts('head');
        static::registerScripts('footer');
    }

    /**
     * NOTE: In PHP this function can be called either from Genesis DI container or statically.
     *
     * @param bool|false $addDomain
     * @return string
     */
    public static function domain(?bool $addDomain = null): string
    {
        if (!$addDomain) {
            return '';
        }

        $grav = Grav::instance();
        $absolute = $grav['base_url_absolute'];
        $relative = $grav['base_url_relative'];

        return substr($absolute, 0, -strlen($relative));
    }

    /**
     * @return string
     */
    public static function rootUri(): string
    {
        $grav = Grav::instance();

        return rtrim($grav['base_url'], '/') ?: '/';
    }

    /**
     * @return string
     */
    public static function siteUrl(): string
    {
        static $url;

        if (!$url) {
            // TODO: there should be Grav method to get this!
            $grav = Grav::instance();

            /** @var Config $config */
            $config = $grav['config'];

            /** @var Language $language */
            $language = $grav['language'];

            /** @var Pages $pages */
            $pages = $grav['pages'];

            $active_language = $language->getActive();

            $path_append = rtrim($pages->base(), '/');
            if ($language->getDefault() !== $active_language || $config->get('system.languages.include_default_lang') === true) {
                $path_append .= $active_language ? '/' . $active_language : '';
            }

            $url = rtrim($grav['base_url_absolute'] . $path_append, '/') ?: '/';
        }

        return $url;
    }

    public static function registerStyles(): void
    {
        $grav = Grav::instance();

        /** @var Config $config */
        $config = $grav['config'];

        /** @var Assets $assets */
        $assets = $grav['assets'];

        $styles = static::$stack[0]->getStyles();

        foreach ($styles as $style) {
            switch ($style[':type']) {
                case 'file':
                    $assets->addCss(
                        static::getRelativeUrl((string) $style['href'], (bool) $config->get('system.assets.css_pipeline')),
                        90 + $style[':priority'],
                        true,
                        'head');
                    break;
                case 'inline':
                    $assets->addInlineCss($style['content'], 90 + $style[':priority'], 'head');
                    break;
            }
        }
    }

    /**
     * @param string $group
     */
    protected static function registerScripts(string $group): void
    {
        $grav = Grav::instance();

        /** @var Config $config */
        $config = $grav['config'];

        /** @var Assets $assets */
        $assets = $grav['assets'];

        $scripts = static::$stack[0]->getScripts($group);
        $group = $group === 'footer' ? 'bottom' : $group;

        foreach ($scripts as $script) {
            switch ($script[':type']) {
                case 'file':
                    $assets->addJs(
                        static::getRelativeUrl((string) $script['src'], (bool) $config->get('system.assets.js_pipeline')),
                        90 + $script[':priority'],
                        true,
                        $script['async'] ? 'async' : ($script['defer'] ? 'defer' : ''),
                        $group
                    );
                    break;
                case 'inline':
                    $assets->addInlineJs($script['content'],
                        90 + $script[':priority'],
                        $group
                    );
                    break;
            }
        }
    }

    /**
     * @param string $url
     * @param bool $pipeline
     * @return string
     */
    protected static function getRelativeUrl(string $url, bool $pipeline): string
    {
        $base = rtrim(static::rootUri(), '/') . '/';

        if (strpos($url, $base) === 0) {
            if ($pipeline) {
                // Remove file timestamp if CSS pipeline has been enabled.
                $url = preg_replace('|[?#].*|', '', $url);
            }

            return substr($url, strlen($base) - 1);
        }
        return $url;
    }

}
