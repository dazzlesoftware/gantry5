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
use Genesis\Framework\Theme as SiteTheme;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Styles
 * @package Genesis\Admin
 */
class Styles
{
    /** @var Genesis */
    protected Genesis $container;
    protected ?array $files = null;
    protected ?array $blocks = null;

    /**
     * Styles constructor.
     * @param Genesis $container
     */
    public function __construct(Genesis $container)
    {
        $this->container = $container;
    }

    /**
     * @return array
     */
    public function all(): array
    {
        if (!$this->blocks)
        {
            $files = $this->locateBlocks();

            $this->blocks = [];
            foreach ($files as $key => $fileArray) {
                $filename = key($fileArray);
                $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
                $this->blocks[$key] = (array) $file->content();
                $file->free();
            }
        }

        return $this->blocks;
    }

    /**
     * @return array
     */
    public function group(): array
    {
        $blocks = $this->all();

        $list = [];
        foreach ($blocks as $name => $style) {
            $type = isset($style['type']) ? $style['type'] : 'block';
            $list[$type][$name] = $style;
        }

        return $this->sort($list);
    }

    /**
     * @param string $id
     * @return string
     */
    public function get(string $id): array
    {
        if (isset($this->blocks[$id])) {
            return $this->blocks[$id];
        }

        $files = $this->locateBlocks();

        if (empty($files[$id])) {
            throw new \RuntimeException('Settings not found.', 404);
        }

        $filename = key($files[$id]);
        $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
        $particle = (array) $file->content();
        $file->free();

        return $particle;
    }

    /**
     * @param string $id
     * @return BlueprintForm
     */
    public function getBlueprintForm(string $id): BlueprintForm
    {
        return BlueprintForm::instance($id, 'genesis-blueprints://styles');
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
        $ordering = (array) $theme->details()['admin.styles'];

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
    protected function locateBlocks(): array
    {
        if (!$this->files) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $paths = $locator->findResources('genesis-blueprints://styles');

            $this->files = (new ConfigFileFinder)->listFiles($paths);
        }

        return $this->files;
    }
}
