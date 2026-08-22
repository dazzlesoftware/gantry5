<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Theme;

use Genesis\Component\Config\Config;
use Genesis\Component\Layout\Layout;
use Genesis\Component\Stylesheet\CssCompilerInterface;
use Twig\Environment;
use Twig\Loader\LoaderInterface;

/**
 * Class ThemeTrait
 * @package Genesis\Framework\Base
 *
 * @property string $path
 * @property string $layout
 */
interface ThemeInterface
{
    // AbstractTheme class

    /**
     * Get context for render().
     *
     * @param array $context
     * @return array
     */
    public function getContext(array $context): array;

    /**
     * Define twig environment.
     *
     * @param Environment $twig
     * @param LoaderInterface $loader
     * @return Environment
     */
    public function extendTwig(Environment $twig, ?LoaderInterface $loader = null): Environment;

    /**
     * Returns renderer.
     *
     * @return Environment
     */
    public function renderer(): Environment;

    /**
     * Render a template file.
     *
     * @param string $file
     * @param array $context
     * @return string
     */
    public function render(string $file, array $context = []): string;

    // ThemeTrait class

    /**
     * Update all CSS files in the theme.
     *
     * @param array $outlines
     * @return array List of CSS warnings.
     */
    public function updateCss(?array $outlines = null): array;

    /**
     * Set current layout.
     *
     * @param string $name
     * @param bool $force
     * @return $this
     */
    public function setLayout(?string $name = null, bool $force = false): static;

    /**
     * Get current preset.
     *
     * @param  bool $forced     If true, return only forced preset or null.
     * @return string|null $preset
     */
    public function preset(bool $forced = false): ?string;

    /**
     * Set preset to be used.
     *
     * @param string $name
     * @return $this
     */
    public function setPreset(?string $name = null): static;

    /**
     * Return CSS compiler used in the theme.
     *
     * @return CssCompilerInterface
     * @throws \RuntimeException
     */
    public function compiler(): CssCompilerInterface;

    /**
     * Returns URL to CSS file.
     *
     * If file does not exist, it will be created by using CSS compiler.
     *
     * @param string $name
     * @return string
     */
    public function css(string $name): string;

    /**
     * Return all CSS variables.
     *
     * @return array
     */
    public function getCssVariables(): array;

    /**
     * Returns style presets for the theme.
     *
     * @return Config
     */
    public function presets(): Config;

    /**
     * Return name of the used layout preset.
     *
     * @return string
     * @throws \RuntimeException
     */
    public function type(): string;

    /**
     * Load current layout and its configuration.
     *
     * @param string $name
     * @return Layout
     * @throws \LogicException
     */
    public function loadLayout(?string $name = null): Layout;

    /**
     * Check whether layout has content bock.
     *
     * @return bool
     */
    public function hasContent(): bool;

    /**
     * Returns all non-empty segments from the layout.
     *
     * @return array
     */
    public function segments(): array;

    /**
     * Returns details of the theme.
     *
     * @return ThemeDetails
     */
    public function details(): ThemeDetails;

    /**
     * Returns configuration of the theme.
     *
     * @return array
     */
    public function configuration(): array;

}
