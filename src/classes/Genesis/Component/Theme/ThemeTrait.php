<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Theme;

use Genesis\Component\Config\Config;
use Genesis\Component\Content\Block\ContentBlock;
use Genesis\Component\Content\Block\ContentBlockInterface;
use Genesis\Component\Content\Block\HtmlBlock;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Genesis\GenesisTrait;
use Genesis\Component\Layout\Layout;
use Genesis\Component\Stylesheet\CssCompilerInterface;
use Genesis\Component\Stylesheet\ScssCompiler;
use Genesis\Debugger;
use Genesis\Framework\Document;
use Genesis\Framework\Menu;
use Genesis\Framework\Services\ConfigServiceProvider;
use DazzleSoftware\Toolbox\File\PhpFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class ThemeTrait
 * @package Genesis\Component
 *
 * @property string $path
 * @property string $layout
 */
trait ThemeTrait
{
    use GenesisTrait;

    /** @var Layout */
    protected ?Layout $layoutObject = null;
    /** @var bool */
    protected bool $atoms = false;
    /** @var array */
    protected ?array $segments = null;
    /** @var string|null */
    protected ?string $preset = null;
    /** @var array */
    protected array $cssCache = [];
    /** @var CssCompilerInterface */
    protected ?CssCompilerInterface $compiler = null;
    /** @var array */
    /** @var ThemeDetails */
    protected ?ThemeDetails $details = null;

    /**
     * Register Theme stream.
     *
     * @param string|string[] $savePath
     */
    public function registerStream(string|array|null $savePath = null): void
    {
        $streamName = $this->details()->addStreams();

        /** @var UniformResourceLocator $locator */
        $locator = self::genesis()['locator'];
        $locator->addPath('genesis-theme', '', array_merge((array) $savePath, [[$streamName, '']]));
    }

    /**
     * Update all CSS files in the theme.
     *
     * @param array $outlines
     * @return array List of CSS warnings.
     */
    public function updateCss(?array $outlines = null): array
    {
        $genesis = static::genesis();
        $compiler = $this->compiler();

        if (null === $outlines) {
            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];
            $path = $locator->findResource($compiler->getTarget(), true, true);

            // Make sure that all the CSS files get deleted.
            if (is_dir($path)) {
                Folder::delete($path, false);
            }

            $outlines = $genesis['outlines'];
        }

        // Make sure that PHP has the latest data of the files.
        clearstatcache();

        $warnings = [];
        foreach ($outlines as $outline => $title) {
            $config = ConfigServiceProvider::load($genesis, $outline);

            $compiler->reset()->setConfiguration($outline)->setVariables($config->flatten('styles', '-'));

            $warnings[$outline] = $compiler->compileAll()->getWarnings();
        }

        $check = [];
        foreach ($warnings as $outline => $files) {
            foreach ($files as $file => $list) {
                if ($file === '__TITLE__') {
                    unset($warnings[$outline][$file]);
                    $warnings['__TITLE__'] = $list;
                    continue;
                }
                $filter = isset($check[$file]) ? $check[$file] : [];
                $filtered = array_diff($list, $filter);
                $check[$file] = array_unique(array_merge($filter, $list));
                if ($filtered) {
                    $warnings[$outline][$file] = $filtered;
                } else {
                    unset($warnings[$outline][$file]);
                }
            }
            if (empty($warnings[$outline])) {
                unset($warnings[$outline]);
            }
        }

        return $warnings;
    }

    /**
     * Set layout to be used.
     *
     * @param string $name
     * @param bool $force
     * @return $this
     */
    public function setLayout(?string $name = null, bool $force = false): static
    {
        $genesis = static::genesis();

        // Force new layout to be set.
        if ($force) {
            unset($genesis['configuration']);
        }

        // Set default name only if configuration has not been set before.
        if ($name === null && !isset($genesis['configuration'])) {
            $name = 'default';
        }

        $outline = isset($genesis['configuration']) ? $genesis['configuration'] : null;

        // Set configuration if given.
        if ($name && $name !== $outline) {
            if (\GENESIS_DEBUGGER) {
                Debugger::addMessage("Using Genesis outline {$name}");
            }

            $genesis['configuration'] = $name;
            unset($genesis['config']);
            $genesis['config'] = ConfigServiceProvider::load($genesis, $name);
        }

        return $this;
    }

    /**
     * Get current preset.
     *
     * @param  bool $forced     If true, return only forced preset or null.
     * @return string|null $preset
     */
    public function preset(bool $forced = false): ?string
    {
        $presets = $this->presets()->toArray();

        $preset = $this->preset;

        if (!$preset && !$forced) {
            /** @var Config $config */
            $config = static::genesis()['config'];
            $preset = $config->get('styles.preset', '-undefined-');
        }

        if ($preset && !isset($presets[$preset])) {
            $preset = null;
        }

        return $preset;
    }

    /**
     * Set preset to be used.
     *
     * @param string $name
     * @return $this
     */
    public function setPreset(?string $name = null): static
    {
        // Set preset if given.
        if ($name) {
            $this->preset = $name;
        }

        return $this;
    }

    /**
     * Return CSS compiler used in the theme.
     *
     * @return CssCompilerInterface
     * @throws \RuntimeException
     */
    public function compiler(): CssCompilerInterface
    {
        if (!$this->compiler) {
            $compilerClass = (string) $this->details()->get('configuration.css.compiler', ScssCompiler::class);

            if (!class_exists($compilerClass)) {
                throw new \RuntimeException('CSS compiler used by the theme not found');
            }

            $details = $this->details();

            /** @var CssCompilerInterface $compiler */
            $this->compiler = new $compilerClass();
            $this->compiler
                ->setTarget($details->get('configuration.css.target'))
                ->setPaths($details->get('configuration.css.paths'))
                ->setFiles($details->get('configuration.css.files'))
                ->setFonts($details->get('configuration.fonts'));
        }

        $preset = $this->preset(true);
        if ($preset) {
            $this->compiler->setConfiguration($preset);
        } else {
            $genesis = static::genesis();
            $this->compiler->setConfiguration(isset($genesis['configuration']) ? $genesis['configuration'] : 'default');
        }

        return $this->compiler->reset();
    }

    /**
     * Returns URL to CSS file.
     *
     * If file does not exist, it will be created by using CSS compiler.
     *
     * @param string $name
     * @return string
     */
    public function css(string $name): string
    {
        if (!isset($this->cssCache[$name])) {
            $compiler = $this->compiler();

            if ($compiler->needsCompile($name, [$this, 'getCssVariables'])) {
                if (\GENESIS_DEBUGGER) {
                    Debugger::startTimer("css-{$name}", "Compiling CSS: {$name}");
                    Debugger::addMessage("Compiling CSS: {$name}");
                }

                $compiler->compileFile($name);

                if (\GENESIS_DEBUGGER) {
                    Debugger::stopTimer("css-{$name}");
                }
            }

            $this->cssCache[$name] = $compiler->getCssUrl($name);
        }

        return $this->cssCache[$name];
    }

    /**
     * @return array
     */
    public function getCssVariables(): array
    {
        if ($this->preset) {
            $variables = $this->presets()->flatten($this->preset . '.styles', '-');
        } else {
            $genesis = self::genesis();
            /** @var Config $config */
            $config = $genesis['config'];
            $variables = $config->flatten('styles', '-');
        }

        return $variables;
    }

    /**
     * Returns style presets for the theme.
     *
     * @return Config
     */
    public function presets(): Config
    {
        static $presets;

        if (!$presets) {
            $genesis = static::genesis();

            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];

            $filename = $locator->findResource('genesis-theme://genesis/presets.yaml');
            $file = CompiledYamlFile::instance($filename);
            $presets = new Config((array)$file->content());
            $file->free();
        }

        return $presets;
    }

    /**
     * Return name of the used layout preset.
     *
     * @return string
     * @throws \RuntimeException
     */
    public function type(): string
    {
        if (!$this->layoutObject) {
            throw new \RuntimeException('Function called too early');
        }
        $name = isset($this->layoutObject->preset['name']) ? $this->layoutObject->preset['name'] : 'unknown';

        return $name;
    }

    /**
     * Load current layout and its configuration.
     *
     * @param string $name
     * @return Layout
     * @throws \LogicException
     */
    public function loadLayout(?string $name = null): Layout
    {
        if (!$name) {
            try {
                $name = static::genesis()['configuration'];
            } catch (\Exception $e) {
                throw new \LogicException('Genesis: Outline has not been defined yet', 500);
            }
        }

        if (!isset($this->layoutObject) || $this->layoutObject->name !== $name) {
            $layout = Layout::instance($name);

            if (!$layout->exists()) {
                $layout = Layout::instance('default');
            }

            // TODO: Optimize
            $this->layoutObject = $layout->init();
        }

        return $this->layoutObject;
    }

    /**
     * Check whether layout has content bock.
     *
     * @return bool
     */
    public function hasContent(): bool
    {
        $layout = $this->loadLayout();
        $content = $layout->referencesByType('system', 'content');

        return !empty($content);
    }

    /**
     * Load atoms and assets from the page settings.
     *
     * @since 5.4.9
     */
    public function loadAtoms(): void
    {
        if (!$this->atoms) {
            $this->atoms = true;

            if (\GENESIS_DEBUGGER) {
                Debugger::startTimer('atoms', 'Preparing atoms');
            }

            $genesis = static::genesis();

            /** @var Config $config */
            $config = $genesis['config'];

            /** @var Document $document */
            $document = $genesis['document'];

            $atoms = (array) $config->get('page.head.atoms');

            foreach ($atoms as $data) {
                $atom = [
                    'type' => 'atom',
                    'subtype' => $data['type'],
                ] + $data;

                try {
                    $block = $this->getContent($atom);
                    $document->addBlock($block);

                } catch (\Exception $e) {
                    if ($genesis->debug()) {
                        throw new \RuntimeException('Rendering atom failed.', 500, $e);
                    }
                }
            }

            $assets = (array) $config->get('page.assets');

            if ($assets) {
                $atom = [
                    'id' => 'page-assets',
                    'title' => 'Page Assets',
                    'type' => 'atom',
                    'subtype' => 'assets',
                    'attributes' => $assets + ['enabled' => 1]
                ];

                try {
                    $block = $this->getContent($atom);
                    $document->addBlock($block);

                } catch (\Exception $e) {
                    if ($genesis->debug()) {
                        throw new \RuntimeException('Rendering CSS/JS assets failed.', 500, $e);
                    }
                }
            }

            if (\GENESIS_DEBUGGER) {
                Debugger::stopTimer('atoms');
            }
        }
    }

    /**
     * Returns all non-empty segments from the layout.
     *
     * @return array
     */
    public function segments(): array
    {
        if (!isset($this->segments)) {
            $this->segments = $this->loadLayout()->toArray();

            if (\GENESIS_DEBUGGER) {
                Debugger::startTimer('segments', 'Preparing layout');
            }

            $this->prepareLayout($this->segments);

            if (\GENESIS_DEBUGGER) {
                Debugger::stopTimer('segments');
            }
        }

        return $this->segments;
    }

    /**
     * Prepare layout for rendering. Initializes all CSS/JS in particles.
     */
    public function prepare(): void
    {
        $this->segments();
    }

    /**
     * Returns details of the theme.
     *
     * @return ThemeDetails
     */
    public function details(): ThemeDetails
    {
        if (!$this->details) {
            $this->details = new ThemeDetails($this->name);
        }
        return $this->details;
    }

    /**
     * Returns configuration of the theme.
     *
     * @return array
     */
    public function configuration(): array
    {
        return (array) $this->details()['configuration'];
    }

    /**
     * Magic setter method
     *
     * @param mixed $offset Asset name value
     * @param mixed $value  Asset value
     */
    public function __set(string $offset, mixed $value): void
    {
        if ($offset === 'title') {
            $offset = 'name';
        }

        $this->details()->offsetSet('details.' . $offset, $value);
    }

    /**
     * Magic getter method
     *
     * @param  mixed $offset Asset name value
     * @return mixed         Asset value
     */
    public function __get(string $offset): mixed
    {
        if ($offset === 'title') {
            $offset = 'name';
        }

        $value = $this->details()->offsetGet('details.' . $offset);

        if ($offset === 'version' && is_int($value)) {
            $value .= '.0';
        }

        return $value;
    }

    /**
     * Magic method to determine if the attribute is set
     *
     * @param  mixed   $offset Asset name value
     * @return boolean         True if the value is set
     */
    public function __isset(string $offset): bool
    {
        if ($offset === 'title') {
            $offset = 'name';
        }

        return $this->details()->offsetExists('details.' . $offset);
    }

    /**
     * Magic method to unset the attribute
     *
     * @param mixed $offset The name value to unset
     */
    public function __unset(string $offset): void
    {
        if ($offset === 'title') {
            $offset = 'name';
        }

        $this->details()->offsetUnset('details.' . $offset);
    }

    /**
     * Prepare layout by loading all the positions and particles.
     *
     * Action is needed before displaying the layout as it recalculates block widths based on the visible content.
     *
     * @param array $items
     * @param bool  $temporary
     * @param bool  $sticky
     * @internal
     */
    protected function prepareLayout(array &$items, bool $temporary = false, bool $sticky = false): void
    {
        foreach ($items as $i => &$item) {
            // Non-numeric items are meta-data which should be ignored.
            if (((string)(int) $i !== (string) $i) || !is_object($item)) {
                continue;
            }

            if (!empty($item->children)) {
                $fixed = true;
                foreach ($item->children as $child) {
                    $fixed &= !empty($child->attributes->fixed);
                }

                $this->prepareLayout($item->children, $fixed, $temporary);
            }

            // TODO: remove hard coded types.
            switch ($item->type) {
                case 'system':
                    break;

                case 'atom':
                case 'particle':
                case 'position':
                case 'spacer':
                    if (\GENESIS_DEBUGGER) {
                        Debugger::startTimer($item->id, "Rendering {$item->id}");
                    }

                    $item->content = $this->renderContent($item, ['prepare_layout' => true]);
                    // Note that content can also be null (postpone rendering).
                    if ($item->content === '') {
                        unset($items[$i]);
                    }

                    if (\GENESIS_DEBUGGER) {
                        Debugger::stopTimer($item->id);
                    }

                    break;

                default:
                    if ($sticky) {
                        $item->attributes->sticky = 1;
                        break;
                    }

                    if (empty($item->children)) {
                        unset($items[$i]);
                        break;
                    }

                    $this->normalizeLayoutColumns($item->children);
            }
        }
    }

    /**
     * Rebalance visible sibling blocks on Bootstrap's 12-column grid.
     *
     * @param array $children
     */
    protected function normalizeLayoutColumns(array &$children): void
    {
        $blocks = [];
        $fixedColumns = 0;
        $dynamicColumns = 0;

        foreach ($children as $child) {
            if ($child->type !== 'block') {
                continue;
            }

            $columns = isset($child->attributes->columns['xs'])
                ? (int) $child->attributes->columns['xs']
                : 12;
            $columns = max(1, min(12, $columns));
            if (!empty($child->attributes->fixed)) {
                $fixedColumns += $columns;
            } else {
                $blocks[] = $child;
                $dynamicColumns += $columns;
            }
        }

        if (!$blocks || $fixedColumns + $dynamicColumns === 12) {
            return;
        }

        $available = max(count($blocks), 12 - $fixedColumns);
        $multiplier = $available / ($dynamicColumns ?: count($blocks));
        $fraction = 0;
        foreach ($blocks as $child) {
            $columns = isset($child->attributes->columns['xs'])
                ? (int) $child->attributes->columns['xs']
                : 12;
            $value = ($columns * $multiplier) + $fraction;
            $newValue = (int) max(1, min(12, round($value)));
            $fraction = $value - $newValue;
            $child->attributes->columns['xs'] = $newValue;
        }
    }

    /**
     * Renders individual content block, like particle or position.
     *
     * Function is used to pre-render content.
     *
     * @param object|array $item
     * @param array $options
     * @return string|null
     */
    public function renderContent(object|array $item, array $options = []): ?string
    {
        $genesis = static::genesis();

        $content = $this->getContent($item, $options);

        /** @var Document $document */
        $document = $genesis['document'];
        $document->addBlock($content);

        $html = $content->toString();

        return false === strpos($html, '@@DEFERRED@@') ? $html : null;
    }

    /**
     * Renders individual content block, like particle or position.
     *
     * Function is used to pre-render content.
     *
     * @param object|array $item
     * @param array $options
     * @return ContentBlock|ContentBlockInterface
     * @since 5.4.3
     */
    public function getContent(object|array $item, array $options = []): ContentBlockInterface
    {
        if (is_array($item)) {
            $item = (object) $item;
        }

        $genesis = static::genesis();

        /** @var Config $global */
        $global = $genesis['global'];

        /** @var Config $config */
        $config = $genesis['config'];

        $production = (bool) $global->get('production');
        $subtype = $item->subtype;
        $enabled = $config->get("particles.{$subtype}.enabled", 1);

        if (!$enabled) {
            return new HtmlBlock;
        }

        $attributes = isset($item->attributes) ? $item->attributes : [];
        $particle = $config->getJoined("particles.{$subtype}", $attributes);

        $cached = false;
        $cacheKey = [];

        // Enable particle caching only in production mode.
        if ($production && isset($particle['caching'])) {
            $caching = $particle['caching'] + ['type' => 'dynamic'];

            switch ($caching['type']) {
                case 'static':
                    $cached = true;
                    break;
                case 'config_matches':
                    if (isset($particle['caching']['values'])) {
                        $values = (array) $particle['caching']['values'];
                        $compare = array_intersect_key($particle, $values);
                        $cached = ($values === $compare);
                    }
                    break;
                case 'menu':
                    /** @var Menu $menu */
                    $menu = $genesis['menu'];
                    $cacheId = $menu->getCacheId();

                    // FIXME: menu caching needs to handle dynamic modules inside menu: turning it off for now.
                    if (false && $cacheId !== null) {
                        $cached = true;
                        $cacheKey['menu_cache_key'] = $cacheId;
                    }
                    break;
            }
        }

        if ($cached) {
            $language = '';
            if (isset($genesis['page']) && isset($genesis['page']->language)) {
                $language = $genesis['page']->language;
            } elseif (isset($genesis['site']) && isset($genesis['site']->language)) {
                $language = $genesis['site']->language;
            }

            $cacheKey['language'] = $language;
            $cacheKey['attributes'] = $particle;
            $cacheKey += (array) $item;

            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];
            $key = md5(json_encode($cacheKey));

            $filename = $locator->findResource("genesis-cache://theme/html/{$key}.php", true, true);
            $file = PhpFile::instance($filename);
            if ($file->exists()) {
                try {
                    return ContentBlock::fromArray((array) $file->content());
                } catch (\Exception $e) {
                    // Invalid cache, continue to rendering.
                    if (\GENESIS_DEBUGGER) {
                        Debugger::addMessage(sprintf('Failed to load %s %s cache', $item->type, $item->id), 'debug');
                    }
                }
            }
        }

        // Create new document context for assets.
        $context = $this->getContext(['segment' => $item, 'enabled' => 1, 'particle' => $particle] + $options);

        /** @var Document $document */
        $document = $genesis['document'];
        $document::push();
        $html = trim($this->render("@nucleus/content/{$item->type}.html.twig", $context));
        $content = $document::pop()->setContent($html);

        if (isset($file)) {
            // Save HTML and assets into the cache.
            if (\GENESIS_DEBUGGER) {
                Debugger::addMessage(sprintf('Caching %s %s', $item->type, $item->id), 'debug');
            }

            $file->save($content->toArray());
        }

        return $content;
    }
}
