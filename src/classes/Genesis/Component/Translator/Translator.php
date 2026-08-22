<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Translator;

use Genesis\Component\File\CompiledYamlFile;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Translator
 * @package Genesis\Component\Translator
 */
class Translator implements TranslatorInterface
{
    /** @var string */
    protected string $default = 'en';
    /** @var string */
    protected string $active = 'en';
    /** @var array */
    protected array $sections = [];
    /** @var array */
    protected array $translations = [];
    /** @var array */
    protected array $untranslated = [];

    /**
     * @param string $string
     * @return string
     */
    public function translate(string $string, mixed ...$arguments): string
    {
        if (preg_match('|^GENESIS(_[A-Z0-9]+){2,}$|', $string)) {
            list(, $section, $code) = explode('_', $string, 3);

            $string = ($this->find($this->active, $section, $string) ?: $this->find($this->default, $section, $string)) ?: $string;
        }

        if ($arguments === []) {
            return $string;
        }

        return sprintf($string, ...$arguments);
    }

    /**
     * Set new active language if given and return previous active language.
     *
     * @param  string  $language  Language code. If not given, current language is kept.
     * @return string  Previously active language.
     */
    public function active(?string $language = null): string
    {
        $previous = $this->active;

        if ($language) {
            $this->active = $language;
        }

        return $previous;
    }

    /**
     * @return array
     */
    public function untranslated(): array
    {
        return $this->untranslated;
    }

    /**
     * @param string $language
     * @param string $section
     * @param string $string
     * @return string|null
     */
    protected function find(string $language, string $section, string $string): ?string
    {
        if (!isset($this->sections[$language][$section])) {
            $translations = $this->load($language, $section);

            if (isset($this->translations[$language])) {
                $this->translations[$language] += $translations;
            } else {
                $this->translations[$language] = $translations;
            }

            $this->sections[$language][$section] = !empty($translations);
        }

        if (!isset($this->translations[$language][$string])) {
            $this->untranslated[$language][$section][$string] = null;

            return null;
        }

        return (string) $this->translations[$language][$string];
    }

    /**
     * @param string $language
     * @param string $section
     * @return array
     */
    protected function load(string $language, string $section): array
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $section = strtolower($section);
        if ($section === 'engine') {
            // TODO: add support for other engines than nucleus.
            $section = 'nucleus';
        }

        $filename = 'genesis-admin://translations/' . $language . '/' . $section . '.yaml';
        $file = CompiledYamlFile::instance($filename);

        if (!$file->exists() && ($pos = strpos($language, '-'))) {
            $filename = 'genesis-admin://translations/' . substr($language, 0, $pos) . '/' . $section . '.yaml';
            $file = CompiledYamlFile::instance($filename);
        }

        /** @var string $cachePath */
        $cachePath = $locator->findResource('genesis-cache://translations', true, true);
        $translations = (array) $file->setCachePath($cachePath)->content();
        $file->free();

        return $translations;
    }
}
