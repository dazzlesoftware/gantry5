<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Config\ConfigFileFinder;
use Genesis\Component\Genesis\GenesisTrait;
use Genesis\Component\Menu\AbstractMenu;
use Genesis\Component\Menu\Item;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Menu
 * @package Genesis\Framework
 *
 * phpBB has no page tree / native nav-menu API (unlike Grav's Flex Pages or WordPress's
 * wp_nav_menu) to build menu items from -- so unlike those platforms' Menu classes,
 * getItemsFromPlatform() always returns an empty list here. Every phpBB Genesis menu is
 * therefore effectively a "custom" menu: every item comes purely from Genesis's own menu YAML
 * (AbstractMenu::addCustom(), which this relies on unchanged) -- links, separators, headings and
 * particles the admin builds directly in the Menu Manager, never platform-page-derived entries.
 */
class Menu extends AbstractMenu
{
    use GenesisTrait;

    public function __construct()
    {
        $this->default = 'mainmenu';
        $this->active = 'mainmenu';
    }

    /**
     * @return array
     */
    public function getMenus()
    {
        static $list;

        if ($list === null) {
            $genesis = static::genesis();

            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];

            $finder = new ConfigFileFinder;

            $list = $finder->getFiles($locator->findResources('genesis-config://menu', false));

            // Always have main menu.
            $list += ['mainmenu' => 1];

            $list = array_keys($list);
            sort($list);
        }

        return $list;
    }

    /**
     * @return array
     */
    public function getMenuOptions()
    {
        $list = [];
        foreach ($this->getMenus() as $val) {
            $list[$val] = ucwords($val);
        }
        sort($list);

        return $list;
    }

    /**
     * @return string
     */
    public function getDefaultMenuName()
    {
        return 'mainmenu';
    }

    /**
     * @return bool
     */
    public function hasDefaultMenu()
    {
        return true;
    }

    /**
     * @return string
     */
    public function getActiveMenuName()
    {
        return 'mainmenu';
    }

    /**
     * @return bool
     */
    public function hasActiveMenu()
    {
        return true;
    }

    /**
     * @return string|null
     */
    public function getCacheId()
    {
        return null;
    }

    /**
     * No platform page tree to pull menu items from -- everything comes from the menu YAML
     * itself via AbstractMenu::addCustom().
     *
     * @param int $levels
     * @return array
     */
    protected function getItemsFromPlatform($levels)
    {
        return [];
    }

    /**
     * @param string $path
     * @param array $menuItems
     * @return string
     */
    protected function calcBase($path, array $menuItems = [])
    {
        $path = trim((string) $path, '/');

        return $path !== '' ? $path : ($this->active ?: $this->default);
    }

    /**
     * @param array $params
     * @param array $items
     */
    public function getList(array $params, array $items)
    {
        $this->base = $this->calcBase($params['base']);
        $this->root = '';

        if (!$items) {
            // menumanager.js's drag-and-drop needs an existing top-level <li> to compute a drop
            // location against -- an empty <ul> (no items at all, which is the permanent starting
            // state for every phpBB menu, since there's no page tree to seed one from) means every
            // drag of a Particle/Module onto the top level is rejected outright
            // (menumanager.js's `location()`: `if (this.isParticle && (targetType === 'main' &&
            // !dataLevel)) { matched = false; return; }` -- `dataLevel` only exists on `<li>`
            // elements, never on the empty container itself). A single seed link item gives drags
            // a real anchor to land next to; the admin is free to delete it afterwards.
            $item = new Item($this, [
                'id' => 'home',
                'parent_id' => '',
                'path' => 'home',
                'alias' => 'home',
                'type' => 'link',
                'link' => '/',
                'level' => 1,
                'title' => 'Home',
            ]);
            $item->url($item->link);
            $this->add($item);

            return;
        }

        $this->addCustom($params, $items);
    }
}
