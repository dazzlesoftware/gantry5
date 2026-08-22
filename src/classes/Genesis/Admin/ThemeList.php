<?php

declare(strict_types=1);

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
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class ThemeList
 * @package Genesis\Admin
 */
class ThemeList
{
    protected static ?array $items = null;

    /**
     * @return array
     */
    public static function getThemes(): array
    {
        if (!is_array(static::$items)) {
            static::loadThemes();
        }

        return static::$items;
    }

    /**
     * @param string $name
     * @return ThemeDetails|null
     */
    public static function getTheme(string $name): ?ThemeDetails
    {
        if (!is_array(static::$items)) {
            static::loadThemes();
        }

        return isset(static::$items[$name]) ? static::$items[$name] : null;
    }

    protected static function loadThemes(): void
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        /** @var array|ThemeDetails[] $list */
        $list = [];

        $files = Folder::all('genesis-themes://', ['recursive' => false, 'files' => false]);
        natsort($files);

        foreach ($files as $theme) {
            try {
                if ($locator('genesis-themes://' . $theme . '/genesis/theme.yaml')) {
                    $details = new ThemeDetails($theme);
                    $details->addStreams();

                    $details['name'] = $theme;
                    $details['title'] = $details['details.name'];
                    $details['preview_url'] = $genesis['platform']->getThemePreviewUrl($theme);
                    $details['admin_url'] = $genesis['platform']->getThemeAdminUrl($theme);
                    $details['params'] = [];

                    $list[$details->name] = $details;
                }
            } catch (\Exception $e) {
                // Do not add broken themes into the list.
                continue;
            }
        }

        // Add Thumbnails links after adding all the paths to the locator.
        foreach ($list as $details) {
            $details['thumbnail'] = $details->getUrl("details.images.thumbnail");
        }

        static::$items = $list;
    }
}
