<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Component\Config\BlueprintForm;
use Genesis\Component\Config\ConfigFileFinder;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Framework\Genesis;
use Genesis\Framework\Platform;
use Genesis\Framework\Theme as SiteTheme;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Particles
 * @package Genesis\Admin
 */
class Particles
{
    /** @var array<string,string> */
    protected const CATEGORIES = [
        'dynamic-content' => 'Dynamic Content',
        'general' => 'General',
        'content' => 'Content',
        'media' => 'Media',
        'slider' => 'Slider'
    ];
    /** @var Genesis */
    protected Genesis $container;
    /** @var array|null */
    protected ?array $files = null;
    /** @var array|null */
    protected ?array $particles = null;
    /** @var array|null */
    protected ?array $themeParticleNames = null;

    /**
     * Particles constructor.
     * @param Genesis $container
     */
    public function __construct(Genesis $container)
    {
        $this->container = $container;
    }

    /**
     * @param string|null $outline
     * @param string|null $particle
     * @return bool
     */
    public function overrides(?string $outline, ?string $particle = null): bool
    {
        if ($outline === null || $outline === '') {
            return false;
        }

        if ($outline === 'default') {
            return true;
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        if ($particle) {
            $resource = $locator->findResources("genesis-theme://config/{$outline}/particles/{$particle}.yaml");
            return !empty($resource);
        }

        $resource = $locator->findResources("genesis-theme://config/{$outline}/particles");
        return !empty($resource);
    }

    /**
     * @return array
     */
    public function all(): array
    {
        if (null ===$this->particles) {
            /** @var Platform $platform */
            $platform = $this->container['platform'];
            $files = $this->locateParticles();

            $this->particles = [];
            foreach ($files as $key => $fileArray) {
                $filename = key($fileArray);
                $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
                $particle = (array)$file->content();
                $file->free();

                if (empty($particle['dependencies']) || $platform->checkDependencies($particle['dependencies'])) {
                    $this->particles[$key] = $particle;
                }
            }
        }

        return $this->particles;
    }

    /**
     * @param array $exclude
     * @return array
     */
    public function group(array $exclude = []): array
    {
        $particles = $this->all();

        $list = [];
        foreach ($particles as $name => $particle) {
            $type = isset($particle['type']) ? $particle['type'] : 'particle';
            if (in_array($type, $exclude, true)) {
                continue;
            }
            if (in_array($type, ['spacer', 'system'], true)) {
                $type = 'position';
            }
            if ($this->isThemeParticle($name)) {
                $particle['_genesis_source'] = 'theme';
            }
            $list[$type][$name] = $particle;
        }

        return $this->sort($list);
    }

    /**
     * @param string $id
     * @return array
     */
    public function get(string $id): array
    {
        if (isset($this->particles[$id])) {
            return $this->particles[$id];
        }

        $files = $this->locateParticles();

        if (empty($files[$id])) {
            throw new \RuntimeException('Settings not found.', 404);
        }

        $filename = key($files[$id]);
        $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
        $particle = (array)$file->content();
        $particle['subtype'] = $id; // TODO: can this be done better or is it fine like that?
        $file->free();

        return $particle;
    }

    /**
     * @param string $id
     * @return BlueprintForm
     */
    public function getBlueprintForm(string $id): BlueprintForm
    {
        return BlueprintForm::instance($id, 'genesis-blueprints://particles');
    }

    /**
     * @param array $blocks
     * @return array
     */
    protected function sort(array $blocks): array
    {
        $list = [];

        /** @var SiteTheme $theme */
        $theme = $this->container['theme'];
        $ordering = (array) $theme->details()['admin.settings'] ?: [
                'particle' => [],
                'position' => ['position', 'spacer', 'messages', 'content'],
                'atom' => []
            ];

        ksort($blocks);

        foreach ($ordering as $name => $order) {
            if (isset($blocks[$name])) {
                $list[$name] = $this->sortItems($blocks[$name], (array) $order);
            }
        }
        $list += $blocks;

        return $list;
    }

    /**
     * @param array $items
     * @param array $ordering
     * @return array
     */
    protected function sortItems(array $items, array $ordering): array
    {
        $list = [];

        ksort($items);

        foreach ($ordering as $name) {
            if (isset($items[$name])) {
                $list[$name] = $items[$name];
            }
        }
        $list += $items;

        return $list;
    }

    /**
     * @return array
     */
    protected function locateParticles(): array
    {
        if (!$this->files) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $paths = $locator->findResources('genesis-blueprints://particles');

            $this->files = (new ConfigFileFinder)->listFiles($paths);
        }

        return $this->files;
    }

    /**
     * Returns true when the active particle blueprint is supplied by the theme.
     * Theme overrides of engine particles are intentionally treated as theme particles.
     *
     * @param string $name
     * @return bool
     */
    public function isThemeParticle(string $name): bool
    {
        if (null === $this->themeParticleNames) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $paths = $locator->findResources('genesis-theme://particles');
            $files = (new ConfigFileFinder)->listFiles($paths);
            $this->themeParticleNames = array_fill_keys(array_keys($files), true);
        }

        return isset($this->themeParticleNames[$name]);
    }

    /**
     * Categorize a particle for the admin picker. Particle blueprints may override
     * the automatic classification with a top-level "category" value.
     *
     * @param string $name
     * @param array $particle
     * @return array{label:string,slug:string}
     */
    public function category(string $name, array $particle = []): array
    {
        $category = strtolower(trim((string)($particle['category'] ?? '')));
        $category = str_replace(['_', ' '], '-', $category);

        if (!isset(self::CATEGORIES[$category])) {
            $category = 'general';
        }

        return ['label' => self::CATEGORIES[$category], 'slug' => $category];
    }

    /**
     * @return array<string,string>
     */
    public function categories(): array
    {
        return self::CATEGORIES;
    }
}
