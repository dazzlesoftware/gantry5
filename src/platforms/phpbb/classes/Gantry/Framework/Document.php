<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Content\Document\HtmlDocument;
use Gantry\phpBB\Runtime;

/**
 * Class Document
 * @package Gantry\Framework
 *
 * phpBB has no dedicated asset pipeline like Grav, so registered styles/scripts are rendered
 * to plain HTML and assigned as template variables. The style's overall_header.html /
 * overall_footer.html print {GANTRY_HEAD_ASSETS} / {GANTRY_FOOTER_ASSETS} where they belong.
 */
class Document extends HtmlDocument
{
    public static function registerAssets()
    {
        static::registerFrameworks();

        /** @var \phpbb\template\template $template */
        $template = Runtime::service('template');

        $head = '';
        foreach (static::$stack[0]->getStyles() as $style) {
            $head .= static::renderStyle($style);
        }
        foreach (static::$stack[0]->getScripts('head') as $script) {
            $head .= static::renderScript($script);
        }

        $footer = '';
        foreach (static::$stack[0]->getScripts('footer') as $script) {
            $footer .= static::renderScript($script);
        }

        $template->assign_vars([
            'GANTRY_HEAD_ASSETS' => $head,
            'GANTRY_FOOTER_ASSETS' => $footer,
        ]);
    }

    /**
     * @param array $style
     * @return string
     */
    protected static function renderStyle($style)
    {
        if ($style[':type'] === 'file') {
            $href = htmlspecialchars($style['href'], ENT_QUOTES);

            return "<link rel=\"stylesheet\" href=\"{$href}\">\n";
        }

        return "<style>{$style['content']}</style>\n";
    }

    /**
     * @param array $script
     * @return string
     */
    protected static function renderScript($script)
    {
        if ($script[':type'] === 'file') {
            $src = htmlspecialchars($script['src'], ENT_QUOTES);
            $attribs = ($script['async'] ? ' async' : '') . ($script['defer'] ? ' defer' : '');

            return "<script src=\"{$src}\"{$attribs}></script>\n";
        }

        return "<script>{$script['content']}</script>\n";
    }

    /**
     * @param bool|null $addDomain
     * @return string
     */
    public static function domain($addDomain = null)
    {
        if (!$addDomain) {
            return '';
        }

        return Runtime::webRoot();
    }

    /**
     * @return string
     */
    public static function rootUri()
    {
        return Runtime::webRoot() ?: '/';
    }

    /**
     * @return string
     */
    public static function siteUrl()
    {
        return Runtime::webRoot() ?: '/';
    }
}
