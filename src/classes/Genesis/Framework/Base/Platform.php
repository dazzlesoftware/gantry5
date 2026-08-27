<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Base;

use Genesis\Component\Filesystem\Folder;
use Genesis\Framework\Document;
use DazzleSoftware\Toolbox\ArrayTraits\Export;
use DazzleSoftware\Toolbox\ArrayTraits\NestedArrayAccess;
use DazzleSoftware\Toolbox\DI\Container;

/**
 * The Platform Configuration class contains configuration information.
 *
 * @author Dazzle Software https://dazzlesoftware.org
 * @license MIT
 */
abstract class Platform
{
    use NestedArrayAccess, Export;

    /** @var string */
    protected string $name = '';
    /** @var array */
    protected array $features = [];
    /** @var string */
    protected string $settings_key = '';
    /** @var array */
    protected array $items;
    /** @var Container */
    protected Container $container;

    /**
     * Platform constructor.
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        $this->container = $container;

        //Make sure that cache folder exists, otherwise it will be removed from the lookup.
        $cachePath = $this->getCachePath();
        Folder::create($cachePath);

        $this->items = [
            'streams' => [
                // Cached files.
                'genesis-cache' => [
                    'type' => 'Stream',
                    'force' => true,
                    'prefixes' => ['' => [$cachePath]]
                ],
                // Container for all frontend themes.
                'genesis-themes' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getThemesPaths()
                ],
                // Selected frontend theme.
                'genesis-theme' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getThemePaths()
                ],
                // System defined media files.
                'genesis-assets' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getAssetsPaths()
                ],
                // User defined media files.
                'genesis-media' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getMediaPaths()
                ],
                // Container for all Genesis engines.
                'genesis-engines' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getEnginesPaths()
                ],
                // Genesis engine used to render the selected theme.
                'genesis-engine' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => $this->getEnginePaths()
                ],
                // Layout definitions for the blueprints.
                'genesis-layouts' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => ['' => ['genesis-theme://layouts', 'genesis-engine://layouts']]
                ],
                // Genesis particles.
                'genesis-particles' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => ['' => ['genesis-theme://particles', 'genesis-engine://particles']]
                ],
                // Genesis administration.
                'genesis-admin' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => []
                ],
                // Blueprints for the configuration.
                'genesis-blueprints' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => [
                        '' => ['genesis-theme://blueprints', 'genesis-engine://blueprints'],
                        'particles' => ['genesis-particles://']
                    ]
                ],
                // Configuration from the selected theme.
                'genesis-config' => [
                    'type' => 'ReadOnlyStream',
                    'prefixes' => ['' => ['genesis-theme://config']]
                ]
            ]
        ];
    }

    /**
     * Gets version of CMS.
     *
     * @return string
     */
    abstract public function getVersion(): string;

    /**
     * Compares version of CMS against the given version.
     *
     * @param string $version Lower bound (>=)
     * @param string|null $version2 Upper bound (<)
     * @return bool True if version matches, false otherwise.
     */
    public function checkVersion(string $version, ?string $version2 = null): bool
    {
        $cmsVersion = $this->getVersion();

        return version_compare($cmsVersion, $version, '>=') && (null === $version2 || version_compare($cmsVersion, $version2, '<'));
    }

    abstract public function getCachePath(): string;
    abstract public function getThemesPaths(): array;
    abstract public function getAssetsPaths(): array;
    abstract public function getMediaPaths(): array;

    /**
     * Prefix prepended to a theme's own name to get its installed folder name, if the platform renames
     * theme folders on install (eg. WordPress installs 'argon' as 'wp_argon' to avoid collisions).
     *
     * @return string
     */
    public function getThemeFolderPrefix(): string
    {
        return '';
    }

    /**
     * @return $this
     */
    public function init(): static
    {
        return $this;
    }

    /**
     * @param string $feature
     * @return bool
     */
    public function has(string $feature): bool
    {
        return !empty($this->features[$feature]);
    }

    /**
     * @return array
     */
    public function getThemePaths(): array
    {
        return ['' => []];
    }

    /**
     * @param string $name
     * @return array
     */
    public function getEnginePaths(string $name = 'nucleus'): array
    {
        return ['' => ['genesis-theme://engine', "genesis-engines://{$name}"]];
    }

    /**
     * @return array
     */
    public function getEnginesPaths(): array
    {
        return ['' => []];
    }

    /**
     * @return array
     */
    public function errorHandlerPaths(): array
    {
        return [];
    }

    /**
     * Get preview url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    abstract public function getThemePreviewUrl(string $theme): ?string;

    /**
     * Get administrator url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    abstract public function getThemeAdminUrl(string $theme): ?string;

    /**
     * @return null
     */
    public function settings(): ?string
    {
        return null;
    }

    /**
     * @return string
     */
    public function settings_key(): string
    {
        return $this->settings_key;
    }

    /**
     * @return array|bool
     */
    public function listModules(): array|false
    {
        return false;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @param string $content
     * @param string|int|null $width
     * @param string|int|null $height
     * @return mixed|null
     */
    public function getEditor(string $name, string $content = '', string|int|null $width = null, string|int|null $height = null): mixed
    {
        return null;
    }

    /**
     * @param string $text
     * @return string
     */
    public function filter(string $text): string
    {
        return $text;
    }

    public function finalize(): void
    {
        $genesis = Genesis::instance();
        /** @var Document $document */
        $document = $genesis['document'];

        $document::registerAssets();
    }

    /**
     * @return mixed|null
     */
    public function call(mixed $callable, mixed ...$args): mixed
    {
        return is_callable($callable) ? call_user_func_array($callable, $args) : null;
    }

    /**
     * @param string $action
     * @param int|string|null $id
     * @return bool
     */
    public function authorize(string $action, string|int|null $id = null): bool
    {
        return true;
    }

    /**
     * @param array|string $dependencies
     * @return bool
     * @since 5.4.3
     */
    public function checkDependencies(array|string $dependencies): bool
    {
        if (is_string($dependencies)) {
            return $dependencies === $this->name;
        }

        if (isset($dependencies['platform'])) {
            if (is_string($dependencies['platform']) && $dependencies['platform'] !== $this->name) {
                return false;
            }
            if (!isset($dependencies['platform'][$this->name])) {
                return false;
            }
        }

        return true;
    }
}
