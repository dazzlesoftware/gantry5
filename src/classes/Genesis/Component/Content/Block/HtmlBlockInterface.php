<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Content\Block;

/**
 * @since 5.4.3
 */
interface HtmlBlockInterface extends ContentBlockInterface
{
    /**
     * @return array
     * @since 5.4.3
     */
    public function getAssets(): array;

    /**
     * @return array
     * @since 5.4.3
     */
    public function getFrameworks(): array;

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getStyles(string $location = 'head'): array;

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getScripts(string $location = 'head'): array;

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getHtml(string $location = 'bottom'): array;

    /**
     * @param string $framework
     * @return $this
     * @since 5.4.3
     */
    public function addFramework(string $framework): static;

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     *
     * @example $block->addStyle('assets/js/my.js');
     * @example $block->addStyle(['href' => 'assets/js/my.js', 'media' => 'screen']);
     * @since 5.4.3
     */
    public function addStyle(string|array $element, int $priority = 0, string $location = 'head'): bool;

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineStyle(string|array $element, int $priority = 0, string $location = 'head'): bool;

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addScript(string|array $element, int $priority = 0, string $location = 'head'): bool;

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineScript(string|array $element, int $priority = 0, string $location = 'head'): bool;

    /**
     * @param string $html
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addHtml(string $html, int $priority = 0, string $location = 'bottom'): bool;
}
