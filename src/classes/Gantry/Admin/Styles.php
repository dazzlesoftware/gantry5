<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin;

use Gantry\Component\Config\BlueprintForm;
use Gantry\Component\Config\ConfigFileFinder;
use Gantry\Component\File\CompiledYamlFile;
use Gantry\Framework\Gantry;
use Gantry\Framework\Theme as SiteTheme;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Styles
 * @package Gantry\Admin
 */
class Styles
{
    /** @var Genesis */
    protected $container;
    protected $files;
    protected $blocks;

    /**
     * Styles constructor.
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
        $particle = $file->content();
        $file->free();

        return $particle;
    }

    /**
     * @param string $id
     * @return BlueprintForm
     */
    public function getBlueprintForm($id)
    {
        return BlueprintForm::instance($id, 'gantry-blueprints://styles');
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
            $paths = $locator->findResources('gantry-blueprints://styles');

            $this->files = (new ConfigFileFinder)->listFiles($paths);
        }

        return $this->files;
    }
}
