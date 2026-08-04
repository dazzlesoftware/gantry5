<?php

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
 * Class Page
 * @package Genesis\Admin
 */
class Page
{
    /** @var Genesis */
    protected $container;
    protected $files;
    protected $blocks;

    /**
     * Page constructor.
     * @param Genesis $container
     */
    public function __construct($container)
    {
        $this->container = $container;
    }

    /**
     * @return array
     */
    public function all()
    {
        if (!$this->blocks)
        {
            $files = $this->locateBlocks();

            $this->blocks = [];
            foreach ($files as $key => $fileArray) {
                $filename = key($fileArray);
                $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
                $this->blocks[$key] = $file->content();
                $file->free();
            }
        }

        return $this->blocks;
    }

    /**
     * @return array
     */
    public function group()
    {
        $blocks = $this->all();

        $list = [];
        foreach ($blocks as $name => $setting) {
            $type = isset($setting['type']) ? $setting['type'] : '';
            $list[$type][$name] = $setting;
        }

        return $this->sort($list);
    }

    /**
     * @param string $id
     * @return array
     */
    public function get($id)
    {
        if ($this->blocks[$id]) {
            return $this->blocks[$id];
        }

        $files = $this->locateBlocks();

        if (empty($files[$id])) {
            throw new \RuntimeException('Settings not found.', 404);
        }

        $filename = key($files[$id]);
        $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
        $setting = (array)$file->content();
        $file->free();

        return $setting;
    }

    /**
     * @param string $id
     * @return BlueprintForm
     */
    public function getBlueprintForm($id)
    {
        return BlueprintForm::instance($id, 'genesis-blueprints://page');
    }

    /**
     * @param array $blocks
     * @return array
     */
    protected function sort(array $blocks)
    {
        $list = [];

        /** @var SiteTheme $theme */
        $theme = $this->container['theme'];
        $ordering = (array) $theme->details()['admin.page'];
        if (!count($ordering)) {
            $ordering = ['global' => ['head', 'assets', 'body', 'generics']];
        }

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
    protected function sortItems(array $items, array $ordering)
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
    protected function locateBlocks()
    {
        if (!$this->files) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $paths = $locator->findResources('genesis-blueprints://page');

            $this->files = (new ConfigFileFinder)->listFiles($paths);
        }

        return $this->files;
    }
}
