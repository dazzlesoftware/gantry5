<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Theme\ThemeDetails;
use Genesis\Framework\Genesis;
use Genesis\Framework\Platform;
use Genesis\Framework\ThemeInstaller;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Joomla\Registry\Registry;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * @package Genesis\Admin
 */
class ThemeList
{
    /** @var ThemeDetails[] */
    protected static $items;

    /** @var array */
    protected static $styles;

    /**
     * @return array
     */
    public static function getThemes()
    {
        if (!\is_array(static::$items)) {
            static::loadThemes();
        }

        $list = [];
        foreach (static::$items as $item) {
            $details = static::getTheme($item['name']);
            if ($details) {
                $list[$item['name']] = $details;
            }
        }

        return $list;
    }

    /**
     * @param string $name
     * @return mixed
     */
    public static function getTheme($name)
    {
        $styles = static::getStyles($name);

        return reset($styles);
    }

    /**
     * @param string $template
     * @return array
     */
    public static function getStyles($template = null, $force = false)
    {
        if ($force || !\is_array(static::$styles)) {
            static::loadStyles();
        }

        if ($template) {
            return isset(static::$styles[$template]) ? static::$styles[$template] : [];
        }

        $list = [];
        foreach (static::$styles as $styles) {
            $list += $styles;
        }

        ksort($list);

        return $list;
    }

    /**
     *
     */
    protected static function loadThemes()
    {
        $genesis = Genesis::instance();

        /** @var Platform $platform */
        $platform = $genesis['platform'];

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        /** @var ThemeDetails[] $list */
        $list = [];

        $files = Folder::all('genesis-themes://', ['recursive' => false, 'files' => false]);
        natsort($files);

        foreach ($files as $theme) {
            if ($locator('genesis-themes://' . $theme . '/genesis/theme.yaml')) {
                $details = new ThemeDetails($theme);
                $details->addStreams();

                $details['name'] = $theme;
                $details['title'] = $details['details.name'];
                $details['preview_url'] = null;
                $details['admin_url'] = $platform->getThemeAdminUrl($theme);
                $details['params'] = [];

                $list[$details->name] = $details;

            }
        }

        // Add Thumbnails links after adding all the paths to the locator.
        foreach ($list as $details) {
            $details['thumbnail'] = $details->getUrl('details.images.thumbnail');
        }

        static::$items = $list;
    }

    /**
     *
     */
    protected static function loadStyles()
    {
        $genesis = Genesis::instance();

        /** @var Platform $platform */
        $platform = $genesis['platform'];

        $db = Factory::getContainer()->get(DatabaseInterface::class);

        $query = $db
            ->getQuery(true)
            ->select('s.id, e.extension_id, s.template AS name, s.title, s.params')
            ->from('#__template_styles AS s')
            ->where('s.client_id = 0')
            ->where('e.enabled = 1')
            ->where('e.state = 0')
            ->leftJoin('#__extensions AS e ON e.element=s.template AND e.type='
                . $db->quote('template') . ' AND e.client_id=s.client_id')
            ->order('s.id');

        $db->setQuery($query);

        $styles = (array) $db->loadObjectList();

        if (!\is_array(static::$items)) {
            static::loadThemes();
        }

        /** @var ThemeDetails[] $list */
        $list = [];
        $repaired = [];

        foreach ($styles as $style)
        {
            $details = isset(static::$items[$style->name]) ? static::$items[$style->name] : null;
            if (!$details) {
                continue;
            }

            if (!isset($repaired[$style->name])) {
                try {
                    (new ThemeInstaller($style->name))->repairUpdateSite();
                } catch (\Exception $e) {
                    // Ignore repair failures here; the theme should still be listed.
                }
                $repaired[$style->name] = true;
            }

            $params = new Registry($style->params);

            $details = clone $details;
            $details['id'] = $style->id;
            $details['extension_id'] = $style->extension_id;
            $details['style'] = $style->title;
            $details['preview_url'] = $platform->getThemePreviewUrl($style->id);
            $details['params'] = $params->toArray();

            $list[$style->name][$style->id] = $details;
        }

        static::$styles = $list;
    }
}
