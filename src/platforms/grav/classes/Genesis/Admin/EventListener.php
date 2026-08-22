<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Component\Config\Config;
use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Menu\Item;
use Genesis\Framework\Genesis;
use Grav\Common\Config as GravConfig;
use Grav\Common\Flex\Types\Pages\PageIndex;
use Grav\Common\Flex\Types\Pages\PageObject;
use Grav\Common\Grav;
use Grav\Common\Uri;
use Grav\Framework\Flex\Flex;
use Genesis\Component\Event\Event;
use Genesis\Admin\Events\AssigmentsEvent;
use Genesis\Admin\Events\LayoutEvent;
use Genesis\Admin\Events\MenuEvent;
use Genesis\Admin\Events\SettingsEvent;
use Genesis\Admin\Events\StylesEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class EventListener
 * @package Genesis\Admin
 */
class EventListener implements EventSubscriberInterface
{
    /**
     * @return array
     */
    public static function getSubscribedEvents(): array
    {
        return [
            'admin.global.save' => ['onGlobalSave', 0],
            'admin.styles.save' => ['onStylesSave', 0],
            'admin.settings.save' => ['onSettingsSave', 0],
            'admin.layout.save' => ['onLayoutSave', 0],
            'admin.assignments.save' => ['onAssignmentsSave', 0],
            'admin.menus.save' => ['onMenusSave', 0]
        ];
    }

    /**
     * @param Event $event
     */
    public function onGlobalSave(Event $event): void
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        // Use the main configuration file path to avoid multisite domain-specific paths
        $filename = 'user://config/plugins/genesis.yaml';
        $path = $locator->findResource($filename, true, true);
        if (!is_string($path) || $path === '') {
            throw new \RuntimeException('Unable to resolve the Genesis plugin configuration file');
        }
        $file = YamlFile::instance($path);

        $content = (array) $file->content();
        $content['production'] = (bool) $event->data['production'];

        $file->save($content);
        $file->free();
    }

    /**
     * @param Event $event
     */
    public function onStylesSave(StylesEvent $event): void
    {
        $cookie = md5($event->theme->name);
        $this->updateCookie($cookie, '', time() - 42000);
    }

    /**
     * @param string $name
     * @param string $value
     * @param int $expire
     */
    protected function updateCookie(string $name, string $value, int $expire = 0): void
    {
        // TODO: move to better place, copied from Genesis main plugin file.
        $grav = Grav::instance();

        /** @var Uri $uri */
        $uri = $grav['uri'];

        /** @var GravConfig $config */
        $config = $grav['config'];

        $path   = (string) $config->get('system.session.path', '/' . ltrim($uri->rootUrl(false), '/'));
        $domain = (string) $uri->host();

        setcookie($name, $value, $expire, $path, $domain);
    }

    /**
     * @param Event $event
     */
    public function onSettingsSave(SettingsEvent $event): void
    {
    }

    /**
     * @param Event $event
     */
    public function onLayoutSave(LayoutEvent $event): void
    {
    }

    /**
     * @param Event $event
     */
    public function onAssignmentsSave(AssigmentsEvent $event): void
    {
    }

    /**
     * @param Event $event
     */
    public function onMenusSave(MenuEvent $event): void
    {
        $menu = $event->menu;

        // Each menu level has ordering from 1..n counting all menu items in the same level.
        $ordering = $this->flattenOrdering($menu['ordering']);
        $this->embedMeta($menu['ordering'], $menu);

        $grav = Grav::instance();

        /** @var Flex $flex */
        $flex = $grav['flex'];
        $directory = $flex->getDirectory('pages');
        if (!$directory) {
            throw new \RuntimeException('Flex Pages are required for Genesis to work!');
        }
        /** @var PageIndex $pages */
        $pages = $directory->getCollection();
        $visible = $pages->visible()->nonModular();
        // TODO: multilang support?
        // TODO: menu particle as a real page?

        $all = [];
        $list = [];

        /** @var PageObject $page */
        foreach ($visible as $page) {
            if (!$page->order()) {
                continue;
            }

            $route = $page->route();
            if (isset($all[$route])) {
                $path = Folder::getRelativePath($page->path());
                $path2 = Folder::getRelativePath($all[$route]);
                throw new \RuntimeException("Found duplicate page: '{$path}' vs '{$path2}'. Please rename or delete one of these folders from your filesystem");
            }
            $all[$route] = $page->path();

            $updated = false;
            $route = $page->getKey();
            $order = isset($ordering[$route]) ? (int) $ordering[$route] : null;
            $parent = $page->parent();
            if ($parent && $order !== null && $order !== (int) $page->order()) {
                $page = $page->move($parent);
                $page->order($order);
                $updated = true;
            }
            if (isset($menu["items.{$route}.title"]) && $page->menu() !== $menu["items.{$route}.title"]) {
                $page->menu($menu["items.{$route}.title"]);
                $updated = true;
            }

            if ($updated) {
                $list[$route] = $page;
            }

            // Remove fields stored in Grav.
            if (isset($menu["items.{$route}"])) {
                unset($menu["items.{$route}.type"], $menu["items.{$route}.link"], $menu["items.{$route}.title"]);
            }
        }

        try {
            foreach ($list as $page) {
                $page->save(false);
            }
        } catch (\RuntimeException $e) {
            throw new \RuntimeException(sprintf('Updating menu item %s failed: %s', $page->rawRoute(), $e->getMessage()), 500, $e);
        }

        foreach ($menu['items'] as $key => $item) {
            $item = $this->normalizeMenuItem($item);
            if ($item) {
                $event->menu["items.{$key}"] = $item;
            } else {
                unset($menu["items.{$key}"]);
            }
        }
    }

    /**
     * @param array $item
     * @param array $ignore
     * @return array
     */
    protected function normalizeMenuItem(array $item, array $ignore = []): array
    {
        static $ignoreList = [
            // Never save derived values.
            'id', 'path', 'route', 'alias', 'parent_id', 'level', 'group', 'current', 'yaml_path', 'yaml_alias'
        ];

        return Item::normalize($item, array_merge($ignore, $ignoreList));
    }

    /**
     * @param array $ordering
     * @param array $parents
     * @param int $i
     * @return array
     */
    protected function flattenOrdering(array $ordering, array $parents = [], int &$i = 0): array
    {
        $list = [];
        $group = isset($ordering[0]);
        foreach ($ordering as $id => $children) {
            $tree = $parents;
            if (!$group && !preg_match('/^(__particle|__widget)/', $id)) {
                $tree[] = $id;
                $name = implode('/', $tree);
                $list[$name] = ++$i;
            }
            if (is_array($children)) {
                $ni = $group ? $i : 0;
                $list += $this->flattenOrdering($children, $tree, $ni);
                if ($group) {
                    $i = $ni;
                }
            }
        }

        return $list;
    }

    /**
     * @param array $ordering
     * @param Config $menu
     * @param array $parents
     * @param int $pos
     */
    protected function embedMeta(array $ordering, Config $menu, array $parents = [], int $pos = 0): void
    {
        $isGroup = isset($ordering[0]);
        $name = implode('/', $parents);

        $counts = [];
        foreach ($ordering as $id => $children) {
            $tree = $parents;

            if ($isGroup) {
                $counts[] = \count($children);
            } else {
                $tree[] = $id;
            }
            if (\is_array($children)) {
                $this->embedMeta($children, $menu, $tree, $isGroup ? $pos : 0);

                $pos += \count($children);
            }
        }

        if ($isGroup) {
            $menu["items.{$name}.columns_count"] = $counts;
        }
    }
}
