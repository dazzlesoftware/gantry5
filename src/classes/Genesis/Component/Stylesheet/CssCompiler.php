<?php

declare(strict_types=1);
// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fopen,WordPress.WP.AlternativeFunctions.file_system_operations_fread,WordPress.WP.AlternativeFunctions.file_system_operations_fclose

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Stylesheet;

use Genesis\Component\Config\Config;
use Genesis\Component\Genesis\GenesisTrait;
use Genesis\Framework\Genesis;
use ScssPhp\ScssPhp\Colors;
use DazzleSoftware\Toolbox\File\PhpFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class CssCompiler
 * @package Genesis\Component\Stylesheet
 */
abstract class CssCompiler implements CssCompilerInterface
{
    use GenesisTrait;

    /** @var string */
    protected string $type = '';
    /** @var string */
    protected string $name = '';
    /** @var bool */
    protected bool $debug = false;
    /** @var array */
    protected array $warnings = [];
    /** @var array */
    protected array $fonts = [];
    /** @var array */
    protected array $variables = [];
    /** @var string */
    protected string $target = 'genesis-theme://css-compiled';
    /** @var string */
    protected string $configuration = 'default';
    /** @var array */
    protected array $paths = [];
    /** @var array */
    protected array $realPaths = [];
    /** @var array */
    protected array $files = [];
    /** @var bool */
    protected bool $production;

    public function __construct()
    {
        $genesis = static::genesis();

        /** @var Config $global */
        $global = $genesis['global'];

        // In production mode we do not need to do any other checks.
        $this->production = (bool) $global->get('production');
    }

    /**
     * @return array
     */
    public function getWarnings(): array
    {
        return $this->warnings;
    }

    /**
     * @return string
     */
    public function getTarget(): string
    {
        return $this->target;
    }

    /**
     * @param string $target
     * @return $this
     */
    public function setTarget(?string $target = null): static
    {
        if ($target !== null) {
            $this->target = (string) $target;
        }

        return $this;
    }

    /**
     * @param string $configuration
     * @return $this
     */
    public function setConfiguration(?string $configuration = null): static
    {
        if ($configuration !== null) {
            $this->configuration = $configuration;
        }

        return $this;
    }

    /**
     * @param array $fonts
     * @return $this
     */
    public function setFonts(?array $fonts = null): static
    {
        if ($fonts !== null) {
            // Normalize font data.
            $list = [];
            foreach ($fonts as $family => $data) {
                $family = strtolower($family);

                if (is_array($data)) {
                    // font: [400: url1, 500: url2, 700: url3]
                    $list[$family] = $data;
                } else {
                    // font: url
                    $list[$family] = [400 => (string) $data];
                }
            }

            $this->doSetFonts($list);
        }

        return $this;
    }

    /**
     * @param array $paths
     * @return $this
     */
    public function setPaths(?array $paths = null): static
    {
        if ($paths !== null) {
            $this->paths = $paths;

            /** @var UniformResourceLocator $locator */
            $locator = Genesis::instance()['locator'];

            $list = [[]];
            foreach ($paths as $path) {
                $list[] = $locator->findResources($path);
            }

            $this->realPaths = array_merge(...$list);
        }

        return $this;
    }

    /**
     * @param array $files
     * @return $this
     */
    public function setFiles(?array $files = null): static
    {
        if ($files !== null) {
            $this->files = $files;
        }

         return $this;
    }


    /**
     * @param string $name
     * @return string
     */
    public function getCssUrl(string $name): string
    {
        $out = $name . ($this->configuration !== 'default' ? '_'. $this->configuration : '');

        return "{$this->target}/{$out}.css";
    }

    /**
     * @return $this
     */
    public function compileAll(): static
    {
        foreach ($this->files as $file) {
            $this->compileFile($file);
        }

        return $this;
    }

    /**
     * @param string $in
     * @param callable $variablesCallable
     * @return bool
     */
    public function needsCompile(string $in, callable $variablesCallable): bool
    {
        /** @var array $variables */
        $variables = $variablesCallable();
        $genesis = static::genesis();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $out = $this->getCssUrl($in);
        $path = $locator->findResource($out);

        // Check if CSS file exists at all.
        if (!$path) {
            $this->setVariables($variables);

            return true;
        }

        if ($this->production) {
            // Open the file to see if it contains development comment in the beginning of the file.
            $handle = fopen($path, 'rb');
            $contents = fread($handle, 36);
            fclose($handle);

            if ($contents === '/* GENESIS DEVELOPMENT MODE ENABLED.') {
                $this->setVariables($variables);
                return true;
            }

            // Compare checksum comment in the file.
            if ($contents !== $this->checksum()) {
                $this->setVariables($variables);
                return true;
            }

            // In production mode we do not need to do any other checks.
            return false;
        }

        $uri = Genesis::basename($out);
        $metaFile = PhpFile::instance($locator->findResource("genesis-cache://theme/scss/{$uri}.php", true, true));

        // Check if meta file exists.
        if (!$metaFile->exists()) {
            $this->setVariables($variables);
            return true;
        }

        $content = $metaFile->content();
        $metaFile->free();

        // Check if filename in meta file matches.
        if (empty($content['file']) || $content['file'] !== $out) {
            $this->setVariables($variables);
            return true;
        }

        // Check if meta timestamp matches to CSS file.
        if (filemtime($path) !== $content['timestamp']) {
            $this->setVariables($variables);
            return true;
        }

        $this->setVariables($variables);

        // Check if variables have been changed.
        $oldVariables = isset($content['variables']) ? $content['variables'] : [];

        // Note: Do not use strict check!
        if ($oldVariables != $this->getVariables()) {
            return true;
        }

        // Preload all CSS files to locator cache.
        foreach ($this->paths as $path) {
            $locator->fillCache($path);
        }

        // Check if any of the imported files have been changed.
        $imports = isset($content['imports']) ? $content['imports'] : [];

        if (!$imports) {
            return $this->findImport($in) !== null;
        }

        foreach ($imports as $resource => $timestamp) {
            if ($locator->isStream($resource)) {
                $import = $locator->findResource($resource);
            } else {
                $import = $this->tryImport($resource);
            }
            if (!$import || filemtime($import) !== $timestamp) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array $variables
     * @return $this
     */
    public function setVariables(array $variables): static
    {
        $this->variables = array_filter($variables);

        foreach($this->variables as $var => &$value) {
            if (strpos($var, 'breakpoints-') === 0) {
                // Breakpoints need to be in rem
                $len = strlen($value);
                if (strpos($value, 'px', $len - 2)) {
                    $value = ((float)substr($value, 0, $len - 2) / 16.0) . 'rem';
                } else {
                    $value = preg_replace('/(\d+(\.\d+))em$/i', '\1rem', $value);
                }

            }

            if (is_numeric($value)) {
                continue;
            }

            // Check variable against colors and units.
            /* Test regex against these:
             * Should only match the ones marked as +
             *      - family=Aguafina+Script
             *      - #zzzzzz
             *      - #fff
             *      + #ffaaff
             *      + 33em
             *      + 0.5px
             *      - 50 rem
             *      - rgba(323,323,2323)
             *      + rgba(125,200,100,0.3)
             *      - rgb(120,12,12)
             */
            if (preg_match('/(^(#([a-fA-F0-9]{6})|(rgba\(\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])\s*,\s*((0.[0-9]+)|[01])\s*\)))|(\d+(\.\d+){0,1}(rem|em|ex|ch|vw|vh|vmin|vmax|%|px|cm|mm|in|pt|pc))$)/i', $value)) {
                continue;
            }

            // Check variable against predefined color names (we use ScssPhp SCSS Color class to do that).
            if (Colors::colorNameToColor(strtolower($value)) !== null) {
                continue;
            }

            // All the unknown values need to be quoted.
            $value = "'{$value}'";
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getVariables(): array
    {
        return $this->variables;
    }

    /**
     * @return $this|CssCompilerInterface
     */
    abstract public function reset(): static;

    /**
     * @param string $url
     * @return null|string
     */
    abstract public function findImport(string $url): ?string;

    /**
     * @param int $len
     * @return string
     */
    protected function checksum(int $len = 36): string
    {
        static $checksum;

        if (!$checksum) {
            $checksum = md5(GENESIS_VERSION . ' ' . Genesis::instance()['theme']->version);
        }

        return '/*' . substr($checksum, 0, $len - 4) . '*/';
    }

    /**
     * @param string $out
     * @param string $md5
     * @param string|null $path
     */
    protected function createMeta(string $out, string $md5, ?string $path = null): void
    {
        $genesis = Genesis::instance();

        if ($this->production) {
            return;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $uri = Genesis::basename($out);
        $metaFile = PhpFile::instance($locator->findResource("genesis-cache://theme/scss/{$uri}.php", true, true));
        $data = [
            'file' => $out,
            'timestamp' => filemtime($path ?? $locator->findResource($out)),
            'md5' => $md5,
            'variables' => $this->getVariables(),
            'imports' => $this->getIncludedFiles()
        ];

        // Attempt to lock the file for writing.
        try {
            $metaFile->lock(false);
        } catch (\Exception $e) {
            // Another process has locked the file; we will check this in a bit.
        }
        // If meta file wasn't already locked by another process, save it.
        if ($metaFile->locked() !== false) {
            $metaFile->save($data);
            $metaFile->unlock();
        }
        $metaFile->free();
    }

    /**
     * @param array $list
     */
    abstract protected function doSetFonts(array $list): void;

    /**
     * @return array
     */
    abstract protected function getIncludedFiles(): array;
}
