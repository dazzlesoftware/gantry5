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
use Genesis\phpBB\Runtime;

/**
 * Class Document
 * @package Genesis\Framework
 *
 * phpBB has no dedicated asset pipeline like Grav, so registered styles/scripts are rendered
 * to plain HTML and assigned as template variables. The style's overall_header.html /
 * overall_footer.html print {GENESIS_HEAD_ASSETS} / {GENESIS_FOOTER_ASSETS} where they belong.
 */
class Document extends HtmlDocument
{
    public static function registerAssets(): void
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
            'GENESIS_HEAD_ASSETS' => $head,
            'GENESIS_FOOTER_ASSETS' => $footer,
        ]);
    }

    /**
     * @param array $style
     * @return string
     */
    protected static function renderStyle(array $style): string
    {
        if ($style[':type'] === 'file') {
            $href = htmlspecialchars((string) $style['href'], ENT_QUOTES);

            return "<link rel=\"stylesheet\" href=\"{$href}\">\n";
        }

        return "<style>{$style['content']}</style>\n";
    }

    /**
     * @param array $script
     * @return string
     */
    protected static function renderScript(array $script): string
    {
        if ($script[':type'] === 'file') {
            $src = htmlspecialchars((string) $script['src'], ENT_QUOTES);
            $attribs = ($script['async'] ? ' async' : '') . ($script['defer'] ? ' defer' : '');

            return "<script src=\"{$src}\"{$attribs}></script>\n";
        }

        return "<script>{$script['content']}</script>\n";
    }

    /**
     * @param bool|null $addDomain
     * @return string
     */
    public static function domain(?bool $addDomain = null): string
    {
        if (!$addDomain) {
            return '';
        }

        return Runtime::webRoot();
    }

    /**
     * @return string
     */
    public static function rootUri(): string
    {
        return Runtime::webRoot() ?: '/';
    }

    /**
     * @return string
     */
    public static function siteUrl(): string
    {
        return Runtime::webRoot() ?: '/';
    }
}
