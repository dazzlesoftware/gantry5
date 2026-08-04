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
use Grav\Common\Grav;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Content
 * @package Genesis\Admin
 */
class Content
{
    /** @var Grav */
    protected $container;
    /** @var array */
    protected $files;
    /** @var array */
    protected $content;

    /**
     * Content constructor.
     * @param Grav $container
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
        if (!$this->content) {
            $files = $this->locateBlueprints();

            $this->content = [];
            foreach ($files as $key => $file) {
                $filename = key($file);
                $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
                $this->content[$key] = $file->content();
                $file->free();
            }
        }

        return $this->content;
    }

    /**
     * @return array
     */
    public function group()
    {
        $content = $this->all();

        $list = [];
        foreach ($content as $name => $item) {
            $type = dirname($name);
            $name = Genesis::basename($name);
            $type = isset($item['type']) ? $item['type'] : ($type !== '.' ? $type : 'content');
            $list[$type][$name] = $item;
        }

        return $this->sort($list);
    }

    /**
     * @param $id
     * @return array
     */
    public function get($id)
    {
        if ($this->content[$id]) {
            return $this->content[$id];
        }

        $files = $this->locateBlueprints();

        if (empty($files[$id])) {
            throw new \RuntimeException('Settings not found.', 404);
        }

        $filename = key($files[$id]);
        $file = CompiledYamlFile::instance(GENESIS_ROOT . '/' . $filename);
        $item = (array)$file->content();
        $file->free();

        return $item;
    }

    /**
     * @param string $id
     * @return BlueprintForm
     */
    public function getBlueprintForm($id)
    {
        return BlueprintForm::instance($id, 'genesis-blueprints://content');
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
        $ordering = (array) $theme->details()['admin.content'];

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
    protected function locateBlueprints()
    {
        if (!$this->files) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $paths = $locator->findResources('genesis-blueprints://content');
            if (!$paths) {
                // Deprecated in Genesis 5.1.1
                $paths = $locator->findResources('Genesis-admin://blueprints/content');
            }

            $this->files = (new ConfigFileFinder)->listFiles($paths);
        }

        return $this->files;
    }
}
