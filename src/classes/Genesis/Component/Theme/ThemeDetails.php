<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Theme;

use Genesis\Component\File\CompiledYamlFile;
use Genesis\Component\Filesystem\Streams;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ArrayTraits\Export;
use DazzleSoftware\Toolbox\ArrayTraits\NestedArrayAccessWithGetters;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class ThemeDetails
 * @package Genesis\Component\Theme
 *
 * @property string $name
 */
class ThemeDetails implements \ArrayAccess
{
    use NestedArrayAccessWithGetters, Export;

    protected array $items = [];
    protected ?ThemeDetails $parent = null;

    /**
     * Create new theme details.
     *
     * @param string $theme
     */
    public function __construct(string $theme)
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $filename = $locator->findResource("genesis-themes://{$theme}/custom/genesis/theme.yaml") ?: $locator->findResource("genesis-themes://{$theme}/genesis/theme.yaml");
        if (!$filename) {
            throw new \RuntimeException('Theme not found.', 404);
        }

        /** @var string $cache */
        $cache = $locator->findResource("genesis-cache://{$theme}/compiled/yaml", true, true);

        $file = CompiledYamlFile::instance($filename);
        $this->items = (array)$file->setCachePath($cache)->content();
        $file->free();

        $this->offsetSet('name', $theme);

        $parent = (string) $this->get('configuration.theme.parent', $theme);

        // Some platforms (eg. WordPress) install themes under a prefixed folder name to avoid collisions,
        // while 'configuration.theme.parent' always refers to the theme's own (unprefixed) name.
        $prefix = (string) $genesis['platform']->getThemeFolderPrefix();
        if ($prefix !== '' && strpos($parent, $prefix) !== 0) {
            if ($prefix . $parent === $theme) {
                // Self-reference under the installed (prefixed) name.
                $parent = $theme;
            } elseif (
                $locator->findResource("genesis-themes://{$parent}/genesis/theme.yaml") === false
                && $locator->findResource("genesis-themes://{$prefix}{$parent}/genesis/theme.yaml") !== false
            ) {
                $parent = $prefix . $parent;
            }
        }

        $parent = $parent !== $theme ? $parent : null;

        $this->offsetSet('parent', $parent);
    }

    /**
     * @return string
     */
    public function addStreams(): string
    {
        $genesis = Genesis::instance();

        // Initialize theme stream.
        $streamName = $this->addStream($this->offsetGet('name'), $this->getPaths());

        // Initialize parent theme streams.
        $loaded = [$this->offsetGet('name')];
        $details = $this;

        while (($details = $details->parent())) {
            if (in_array($details->name, $loaded, true)) {
                break;
            }
            $this->addStream($details->name, $details->getPaths(false));
            $loaded[] = $details->name;
        }

        /** @var Streams $streams */
        $streams = $genesis['streams'];
        $streams->register();

        return $streamName;
    }

    /**
     * Get parent theme details if theme has a parent.
     *
     * @return ThemeDetails|null
     * @throws \RuntimeException
     */
    public function parent(): ?ThemeDetails
    {
        $parent = $this->offsetGet('parent');

        if (!$this->parent && $parent) {
            try {
                $this->parent = new ThemeDetails($parent);
            } catch (\RuntimeException $e) {
                throw new \RuntimeException('Parent theme not found.', 404);
            }
        }

        return $this->parent;
    }

    /**
     * Get all possible paths to the theme.
     *
     * @return array
     */
    public function getPaths(bool $overrides = true): array
    {
        $paths = array_merge(
            $overrides ? (array) $this->get('configuration.theme.overrides', 'genesis-theme://custom') : [],
            ['genesis-theme://'],
            (array) $this->get('configuration.theme.base', 'genesis-theme://common')
        );

        $parent = $this->offsetGet('parent');
        if ($parent) {
            // Stream needs to be valid URL.
            $streamName = 'genesis-themes-' . preg_replace('|[^a-z\d+.-]|ui', '-', $parent);
            $paths[] = "{$streamName}://";
        }

        return $this->parsePaths($paths);
    }

    /**
     * Convert theme path into stream URI.
     *
     * @param string $path
     * @return string
     */
    public function getUrl(string $path): string
    {
        $uri = (string) $this->offsetGet($path);

        if (strpos($uri, 'genesis-theme://') === 0) {
            list (, $uri) = explode('://', $uri, 2);
        }
        if (!strpos($uri, '://')) {
            $name = $this->offsetGet('name');

            // Stream needs to be valid URL.
            $streamName = 'genesis-themes-' . preg_replace('|[^a-z\d+.-]|ui', '-', $name);
            $uri = "{$streamName}://{$uri}";
        }

        return $uri;
    }

    /**
     * Turn list of theme paths to be universal, so they can be used outside of the theme.
     *
     * @param array $items
     * @return array
     */
    public function parsePaths(array $items): array
    {
        foreach ($items as &$item) {
            $item = $this->parsePath($item);
        }

        return $items;
    }

    /**
     * Convert theme paths to be universal, so they can be used outside of the theme.
     *
     * @param string $path
     * @return string
     */
    public function parsePath(string $path): string
    {
        if (strpos($path, 'genesis-theme://') === 0) {
            list (, $path) = explode('://', $path, 2);
        }
        if (!strpos($path, '://')) {
            $name = $this->offsetGet('name');
            $path = "genesis-themes://{$name}/{$path}";
        }

        return $path;
    }

    /**
     * @return string|null
     * @deprecated 5.1.5
     */
    public function getParent(): ?string
    {
        return $this->offsetGet('parent');
    }

    /**
     * @param string $name
     * @param array $paths
     * @return string|null
     */
    protected function addStream(string $name, array $paths): string
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        /** @var Streams $streams */
        $streams = $genesis['streams'];

        // Add theme stream.
        $streamName = 'genesis-themes-' . preg_replace('|[^a-z\d+.-]|ui', '-', $name);
        if (!$locator->schemeExists($streamName)) {
            $streams->add([$streamName => ['paths' => $paths]]);
        }

        return $streamName;
    }
}
