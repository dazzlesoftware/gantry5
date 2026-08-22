<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Stylesheet;

/**
 * Interface CssCompilerInterface
 * @package Genesis\Component\Stylesheet
 */
interface CssCompilerInterface
{
    /**
     * @return array
     */
    public function getWarnings(): array;

    /**
     * @return string
     */
    public function getTarget(): string;

    /**
     * @param string $target
     * @return $this
     */
    public function setTarget(?string $target = null): static;

    /**
     * @param string $configuration
     * @return $this
     */
    public function setConfiguration(?string $configuration = null): static;

    /**
     * @param array $paths
     * @return $this
     */
    public function setPaths(?array $paths = null): static;

    /**
     * @param array $files
     * @return $this
     */
    public function setFiles(?array $files = null): static;

    /**
     * @param array $fonts
     * @return $this
     */
    public function setFonts(?array $fonts = null): static;

    /**
     * @param string $name
     * @return string
     */
    public function getCssUrl(string $name): string;

    /**
     * @return array
     */
    public function getVariables(): array;

    /**
     * @param array $variables
     * @return $this
     */
    public function setVariables(array $variables): static;

    /**
     * @param string   $name       Name of function to register to the compiler.
     * @param callable $callback   Function to run when called by the compiler.
     * @return $this
     */
    public function registerFunction(string $name, callable $callback): static;

    /**
     * @param string $name       Name of function to unregister.
     * @return $this
     */
    public function unregisterFunction(string $name): static;

    /**
     * @param string $in
     * @param callable $variables
     * @return bool
     */
    public function needsCompile(string $in, callable $variables): bool;

    /**
     * @param string $in    Filename without path or extension.
     * @return bool         True if the output file was saved.
     * @throws \RuntimeException
     */
    public function compileFile(string $in): bool;

    /**
     * @return $this
     */
    public function reset(): static;

    /**
     * @return $this
     */
    public function compileAll(): static;

    public function resetCache(): static;
}
