<?php

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
    public function getAssets();

    /**
     * @return array
     * @since 5.4.3
     */
    public function getFrameworks();

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getStyles($location = 'head');

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getScripts($location = 'head');

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getHtml($location = 'bottom');

    /**
     * @param string $framework
     * @return $this
     * @since 5.4.3
     */
    public function addFramework($framework);

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
    public function addStyle($element, $priority = 0, $location = 'head');

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineStyle($element, $priority = 0, $location = 'head');

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addScript($element, $priority = 0, $location = 'head');

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineScript($element, $priority = 0, $location = 'head');

    /**
     * @param string $html
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addHtml($html, $priority = 0, $location = 'bottom');
}
