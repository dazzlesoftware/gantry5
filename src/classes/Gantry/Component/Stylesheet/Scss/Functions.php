<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Stylesheet\Scss;

use Gantry\Component\Filesystem\Folder;
use Gantry\Framework\Document;
use Gantry\Framework\Gantry;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\Value\ListSeparator;
use ScssPhp\ScssPhp\Value\SassArgumentList;
use ScssPhp\ScssPhp\Value\SassBoolean;
use ScssPhp\ScssPhp\Value\SassList;
use ScssPhp\ScssPhp\Value\SassNumber;
use ScssPhp\ScssPhp\Value\SassString;
use ScssPhp\ScssPhp\Value\Value;

/**
 * Class Compiler
 * @package Gantry\Component\Stylesheet\Scss
 */
class Functions
{
    protected $compiler;

    /** @var string */
    protected $basePath;
    /** @var array */
    protected $fonts = [];
    /** @var array */
    protected $usedFonts = [];
    /** @var array */
    protected $streamNames = [];
    /** @var array */
    protected $userFunctions = [];

    /**
     * @param Compiler $compiler
     */
    public function setCompiler(Compiler $compiler)
    {
        $this->compiler = $compiler;

        $compiler->registerFunction('url', [$this, 'libUrl'], ['url']);
        $compiler->registerFunction('get-font-url', [$this, 'libGetFontUrl'], ['font']);
        $compiler->registerFunction('get-font-family', [$this, 'libGetFontFamily'], ['family']);
        $compiler->registerFunction('get-local-fonts', [$this, 'libGetLocalFonts'], ['list...']);
        $compiler->registerFunction('get-local-font-weights', [$this, 'libGetLocalFontWeights'], ['font']);
        $compiler->registerFunction('get-local-font-url', [$this, 'libGetLocalFontUrl'], ['font', 'weight']);

        foreach ($this->userFunctions as $name => $userFunction) {
            $compiler->registerFunction($name, $userFunction[0], $userFunction[1]);
        }
    }

    /**
     * @param string   $name
     * @param callable $func
     * @param array    $prototype
     */
    public function registerFunction($name, $func, $prototype = null)
    {
        $this->userFunctions[$name] = [$func, $prototype];

        if ($this->compiler) {
            $this->compiler->registerFunction($name, $func, $prototype);
        }
    }

    /**
     * @param string $name
     */
    public function unregisterFunction($name)
    {
        unset($this->userFunctions[$name]);

        if ($this->compiler) {
            $this->compiler->unregisterFunction($name);
        }
    }

    /**
     * @param string $basePath
     */
    public function setBasePath($basePath)
    {
        /** @var Document $document */
        $document = Gantry::instance()['document'];

        $this->basePath = rtrim($document::rootUri(), '/') . '/' . Folder::getRelativePath($basePath);
    }

    /**
     * @param array $fonts
     */
    public function setFonts(array $fonts)
    {
        $this->fonts = $fonts;
    }

    /**
     * @return $this
     */
    public function reset()
    {
        $this->usedFonts = [];

        return $this;
    }

    /**
     * @param array $args
     * @return string
     * @throws \ScssPhp\ScssPhp\Exception\CompilerException
     */
    public function libUrl(array $args): Value
    {
        // Function has a single parameter.
        $parsed = reset($args);
        if (!$parsed) {
            throw new \InvalidArgumentException('url() is missing parameter');
        }
        $url = $this->valueToString($parsed);

        // Handle ../ inside CSS files (points to current theme).
        if (strpos($url, '../') === 0 && strpos($url, '../', 3) === false) {
            $url = 'gantry-theme://' . substr($url, 3);
        }

        /** @var Document $document */
        $document = Gantry::instance()['document'];

        // Generate URL, failed streams will be transformed to 404 URLs.
        $url = $document::url($url, false, null, false);

        // Changes absolute URIs to relative to make the path to work even if the site gets moved.
        if ($url && $url[0] === '/' && $this->basePath) {
            $url = Folder::getRelativePathDotDot($url, $this->basePath);
        }

        // Make sure that all the URLs inside CSS are https compatible by replacing http:// protocol with //.
        if (strpos($url, 'http://') === 0) {
            $url = str_replace('http://', '//', $url);
        }

        // Return valid CSS.
        return new SassString("url('{$url}')", false);
    }

    /**
     * get-font-url($my-font-variable);
     *
     * @param array $args
     * @return string|false
     */
    public function libGetFontUrl(array $args): Value
    {
        $value = $this->valueToString(reset($args));

        // It's a google font
        if (0 === strpos($value, 'family=')) {
            $fonts = $this->decodeFonts($value);
            $font = reset($fonts);

            // Only return url once per font.
            if ($font && !isset($this->usedFonts[$font])) {
                $this->usedFonts[$font] = true;

                return new SassString("//fonts.googleapis.com/css?{$value}");
            }
        }

        return SassBoolean::create(false);
    }

    /**
     * font-family: get-font-family($my-font-variable);
     *
     * @param array $args
     * @return string
     */
    public function libGetFontFamily(array $args): Value
    {
        $value = $this->valueToString(reset($args));

        return new SassString($this->encodeFonts($this->decodeFonts($value)), false);
    }

    /**
     * get-local-fonts($my-font-variable, $my-font-variable2, ...);
     *
     * @param array $args
     * @return array
     */
    public function libGetLocalFonts(array $args): Value
    {
        $args = $this->expandArguments($args);

        $fonts = [[]];
        foreach ($args as $value) {
            // It's a local font, we need to load any of the mapped fonts from the theme
            $fonts[] = $this->decodeFonts($value, true);
        }
        $fonts = array_merge(...$fonts);
        $fonts = $this->getLocalFonts($fonts);

        // Create a basic list of strings so that SCSS parser can parse the list.
        return new SassList(
            array_map(static fn($font) => new SassString($font), array_keys($fonts)),
            ListSeparator::COMMA
        );
    }

    /**
     * get-local-font-weights(roboto);
     *
     * @param array $args
     * @return array
     */
    public function libGetLocalFontWeights(array $args): Value
    {
        $name = $this->valueToString(reset($args));

        $weights = isset($this->fonts[$name]) ? array_keys($this->fonts[$name]) : [];

        // Create a list of numbers so that SCSS parser can parse the list.
        return new SassList(
            array_map(static fn($weight) => SassNumber::create((int) $weight), $weights),
            ListSeparator::COMMA
        );
    }

    /**
     * get-local-font-url(roboto, 400);
     *
     * @param array $args
     * @return string|false
     */
    public function libGetLocalFontUrl(array $args): Value
    {
        $args = array_map([$this, 'valueToString'], $args);

        $name = isset($args[0]) ? trim($args[0], '\'"') : '';
        $weight = isset($args[1]) ? $args[1] : 400;

        // Only return url once per font.
        $weightName = $name . '-' . $weight;
        if (isset($this->fonts[$name][$weight]) && !isset($this->usedFonts[$weightName])) {
            $this->usedFonts[$weightName] = true;

            return new SassString($this->fonts[$name][$weight], false);
        }

        return SassBoolean::create(false);
    }

    /**
     * Get local font data.
     *
     * @param array $fonts
     * @return array
     */
    protected function getLocalFonts(array $fonts)
    {
        $list = [];
        foreach ($fonts as $family) {
            $family = strtolower($family);

            if (isset($this->fonts[$family])) {
                $list[$family] = $this->fonts[$family];
            }
        }

        return $list;
    }

    /**
     * Convert array of fonts into a CSS parameter string.
     *
     * @param array $fonts
     * @return string
     */
    protected function encodeFonts(array $fonts)
    {
        array_walk($fonts, static function(&$val) {
            // Check if font family is one of the 4 default ones, otherwise add quotes.
            if (!\in_array($val, ['cursive', 'serif', 'sans-serif', 'monospace'], true)) {
                $val = '"' . $val . '"';
            }
        });

        return implode(', ', $fonts);
    }

    /**
     * Convert string into array of fonts.
     *
     * @param  string $string
     * @param  bool   $localOnly
     * @return array
     */
    protected function decodeFonts($string, $localOnly = false)
    {
        if (0 === strpos($string, 'family=')) {
            if ($localOnly) {
                // Do not return external fonts.
                return [];
            }

            // Matches google font family name
            preg_match('/^family=([^&:]+).*$/ui', $string, $matches);
            return [urldecode($matches[1])];
        }

        // Filter list of fonts and quote them.
        $list = (array) explode(',', $string);
        array_walk($list, static function(&$val) {
            $val = trim($val, "'\" \t\n\r\0\x0B");
        });
        array_filter($list);

        return $list;
    }

    /**
     * @param array $args
     * @return mixed
     */
    protected function expandArguments(array $args): array
    {
        if (isset($args[0]) && $args[0] instanceof SassArgumentList) {
            $args = $args[0]->asList();
        }

        return array_map([$this, 'valueToString'], $args);
    }

    protected function valueToString(Value $value): string
    {
        if ($value instanceof SassString) {
            return $value->getText();
        }

        return trim($value->toCssString(), '\'"');
    }
}
