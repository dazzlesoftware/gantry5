<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Content\Document\HtmlDocument;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Uri\Uri;
// Joomla 5-only: no version switch needed here
use Joomla\CMS\WebAsset\WebAssetManager;

/**
 * Class Document
 * @package Genesis\Framework
 */
class Document extends HtmlDocument
{
    protected static $availableFrameworks = [
        'bootstrap' => 'registerBootstrap',
        'bootstrap.5' => 'registerBootstrap5',
        'mootools' => 'registerMootools',
        'mootools.framework' => 'registerMootools',
        'mootools.core' => 'registerMootools',
        'mootools.more' => 'registerMootoolsMore',
        'lightcase' => 'registerLightcase',
        'lightcase.init' => 'registerLightcaseInit',
    ];

    /**
     * @param string $framework
     * @return bool
     */
    public static function addFramework($framework)
    {
        if (!parent::addFramework($framework)) {
            return false;
        }

        // Make sure that if Bootstap framework is loaded, also load CSS.
        if (
            $framework === 'bootstrap'
            || $framework === 'bootstrap.5'
        ) {
            /** @var Theme $theme */
            $theme = Genesis::instance()['theme'];
            $theme->joomla = true;
        }

        return true;
    }

    /**
     *
     */
    public static function registerAssets()
    {
        static::registerFrameworks();
        static::registerStyles();
        static::registerScripts();
    }

    /**
     * NOTE: In PHP this function can be called either from Genesis DI container or statically.
     *
     * @param bool|null $addDomain
     * @return string
     */
    public static function domain($addDomain = null)
    {
        if (!$addDomain) {
            return '';
        }

        $absolute = Uri::root(false);
        $relative = Uri::root(true);

        return substr($absolute, 0, -strlen($relative));
    }

    /**
     * @return string
     */
    public static function rootUri()
    {
        return rtrim(Uri::root(true), '/') ?: '/';
    }

    /**
     * @param bool|null $new
     * @return bool
     */
    public static function errorPage($new = null)
    {
        static $error = false;

        if (isset($new)) {
            $error = (bool) $new;
        }

        return $error;
    }

    protected static function registerStyles()
    {
        if (static::errorPage()) {
            return;
        }

        /** @var CMSApplication $application */
        $application = Factory::getApplication();
        $doc = $application->getDocument();

        $styles = static::$stack[0]->getStyles();

        foreach ($styles as $style) {
            switch ($style[':type']) {
                case 'file':
                    $attribs = array_replace(['type' => $style['type'], 'media' => $style['media']], $style['element']);
                    $attribs = array_filter($attribs, static function($arg) { return null !== $arg; });
                    $doc->addStyleSheet($style['href'], [], $attribs);
                    break;
                case 'inline':
                    $doc->addStyleDeclaration($style['content'], $style['type']);
                    break;
            }
        }
    }

    protected static function registerScripts()
    {
        if (static::errorPage()) {
            return;
        }

        /** @var CMSApplication $application */
        $application = Factory::getApplication();
        $doc = $application->getDocument();

        $scripts = static::$stack[0]->getScripts();

        foreach ($scripts as $script) {
            switch ($script[':type']) {
                case 'file':
                    $attribs = ['mime' => $script['type'], 'defer' => $script['defer'], 'async' => $script['async']];
                    $attribs = array_filter($attribs, static function($arg) { return null !== $arg; });
                    $doc->addScript($script['src'], [], $attribs);
                    break;
                case 'inline':
                    $doc->addScriptDeclaration($script['content'], $script['type']);
                    break;
            }
        }
    }

    protected static function registerBootstrap()
    {
        // For Joomla 5 use Bootstrap 5 implementation
        static::registerBootstrap5();
    }

    protected static function registerBootstrap5()
    {
        if (!static::errorPage()) {
            HTMLHelper::_('bootstrap.framework');

            return;
        }

        /** @var WebAssetManager $wa */
        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();

        array_map(
            static function ($script) use ($wa) {
                $asset = $wa->getAsset('script', 'bootstrap.' . $script);

                // Workaround for error document type.
                static::addHeaderTag(
                    [
                        'tag' => 'script',
                        'src' => $asset->getUri(true) . '?' . $asset->getVersion()
                    ],
                    'head',
                    100
                );
            },
            ['alert', 'button', 'carousel', 'collapse', 'dropdown', 'modal', 'offcanvas', 'popover', 'scrollspy', 'tab', 'toast']
        );
    }

    protected static function registerMootools()
    {
        parent::registerMootools();

        return;
    }

    protected static function registerMootoolsMore()
    {
        parent::registerMootoolsMore();

        return;
    }

    /**
     * Override to support index.php?Itemid=xxx.
     *
     * @param array $matches
     * @return string
     * @internal
     */
    public static function linkHandler(array $matches)
    {
        $url = trim($matches[3]);
        if (strpos($url, 'index.php?') !== 0) {
            list($domain, $timestamp_age) = static::$urlFilterParams;
            $url = static::url(trim($matches[3]), $domain, $timestamp_age);
        }

        return "{$matches[1]}{$matches[2]}=\"{$url}\"";
    }
}
