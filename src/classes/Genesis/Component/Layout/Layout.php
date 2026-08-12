<?php
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,WordPress.WP.AlternativeFunctions.rand_mt_rand

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Layout;

use Genesis\Component\Config\Config;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Debugger;
use Genesis\Framework\Outlines;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ArrayTraits\ArrayAccess;
use DazzleSoftware\Toolbox\ArrayTraits\Export;
use DazzleSoftware\Toolbox\ArrayTraits\ExportInterface;
use DazzleSoftware\Toolbox\ArrayTraits\Iterator;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceIterator;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Layout
 */
class Layout implements \ArrayAccess, \Iterator, ExportInterface
{
    use ArrayAccess, Iterator, Export;

    const VERSION = 7;

    /** @var array */
    protected static $instances = [];
    /** @var array */
    protected static $indexes = [];

    /** @var string */
    public $name;
    /** @var int */
    public $timestamp = 0;
    /** @var array */
    public $preset = [];
    /** @var array */
    /** @var array */
    protected $layout = ['wrapper', 'container', 'section', 'grid', 'block', 'div', 'offcanvas'];
    /** @var bool */
    protected $exists;
    /** @var array */
    protected $items;
    /** @var array|null */
    protected $references;
    /** @var array|null */
    protected $children;
    /** @var array */
    protected $parents = [];
    /** @var array */
    protected $blocks = [];
    /** @var array|null */
    protected $types;
    /** @var array|null */
    protected $inherit;

    /**
     * @return array
     */
    public static function presets()
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        /** @var UniformResourceIterator $iterator */
        $iterator = $locator->getIterator(
            'genesis-layouts://',
            UniformResourceIterator::CURRENT_AS_SELF | UniformResourceIterator::UNIX_PATHS | UniformResourceIterator::SKIP_DOTS
        );

        $files = [];
        /** @var UniformResourceIterator $info */
        foreach ($iterator as $info) {
            $name = $info->getBasename('.yaml');
            if (!$info->isFile() || $info->getExtension() !== 'yaml' || $name[0] === '.') {
                continue;
            }
            $files[] = $name;
        }

        sort($files);

        $results = ['user' => [], 'system' => []];
        foreach ($files as $preset) {
            $scope = $preset && $preset[0] !== '_' ? 'user' : 'system';
            $results[$scope][$preset] = ucwords(trim(preg_replace(['|_|', '|/|'], [' ', ' / '], $preset)));
        }

        return $results;
    }

    /**
     * @param string $name
     * @return array
     * @throws \RuntimeException
     */
    public static function preset($name)
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];
        $filename = $locator->findResource("genesis-layouts://{$name}.yaml");

        if (!$filename) {
            throw new \RuntimeException(sprintf("Preset '%s' not found", $name), 404);
        }

        $layout = LayoutReader::read($filename);
        $layout['preset']['name'] = $name;
        $layout['preset']['timestamp'] = filemtime($filename);

        return $layout;
    }

    /**
     * @param  string $name
     * @return Layout
     */
    public static function instance($name)
    {
        if (!isset(static::$instances[$name])) {
            static::$instances[$name] = static::load($name);
        }

        return static::$instances[$name];
    }

    /**
     * @param  string $name
     * @return Layout
     */
    public static function index($name)
    {
        if (!isset(static::$indexes[$name])) {
            static::$indexes[$name] = static::loadIndex($name, true);
        }

        return static::$indexes[$name];
    }

    /**
     * @param string $name
     * @param array $items
     * @param array $preset
     */
    public function __construct($name, ?array $items = null, ?array $preset = null)
    {
        $this->name = $name;
        $this->items = (array) $items;
        $this->exists = $items !== null;

        // Add preset data from the layout.
        if ($preset) {
            $this->preset = $preset;
        } elseif (isset($this->items['preset'])) {
            $this->preset = (array) $this->items['preset'];
        }

        unset($this->items['preset']);

        $this->preset += [
            'name' => '',
            'timestamp' => 0,
            'image' => 'genesis-admin://images/layouts/default.png'
        ];
    }

    /**
     * @return bool
     */
    public function exists()
    {
        return $this->exists;
    }

    /**
     * Initialize layout.
     *
     * @param  bool  $force
     * @param  bool  $inherit
     * @return $this
     */
    public function init($force = false, $inherit = true)
    {
        if ($force || $this->references === null) {
            $this->initReferences();
            if ($inherit) {
                $this->initInheritance();
            }
        }

        return $this;
    }

    /**
     * Build separate meta-information from the layout.
     *
     * @return array
     */
    public function buildIndex()
    {
        return [
            'name' => $this->name,
            'timestamp' => $this->timestamp,
            'version' => static::VERSION,
            'preset' => $this->preset,
            'positions' => $this->positions(),
            'sections' => $this->sections(),
            'particles' => $this->particles(),
            'inherit' => $this->inherit()
        ];
    }

    /**
     * @return $this
     */
    public function clean()
    {
        $this->references = null;
        $this->types = null;
        $this->inherit = null;

        $this->cleanLayout($this->items);

        return $this;
    }

    /**
     * @param string $old
     * @param string $new
     * @param array  $ids
     * @return $this
     */
    public function updateInheritance($old, $new = null, $ids = null)
    {
        $this->init();

        $inherit = $this->inherit();

        if (!empty($inherit[$old])) {
            foreach ($inherit[$old] as $id => $inheritId) {
                $element = $this->find($id, false);
                if ($element) {
                    $inheritId = isset($element->inherit->particle) ? $element->inherit->particle : $id;
                    if ($new && ($ids === null || isset($ids[$inheritId]))) {
                        // Add or modify inheritance.
                        if (!isset($element->inherit)) {
                            $element->inherit = new \stdClass;
                        }
                        $element->inherit->outline = $new;
                    } else {
                        // Remove inheritance.
                        $element->inherit = new \stdClass;
                        unset($this->inherit[$element->id]);
                    }
                } else {
                    // Element does not exist anymore, remove its reference.
                    unset($this->inherit[$id]);
                }
            }
        }

        return $this;
    }


    /**
     * Save layout.
     *
     * @param bool $cascade
     * @return $this
     */
    public function save($cascade = true)
    {
        if (!$this->name) {
            throw new \LogicException('Cannot save unnamed layout');
        }

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage("Saving layout for outline {$this->name}");
        }

        $name = strtolower(preg_replace('|[^a-z\d_-]|ui', '_', $this->name));

        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        // If there are atoms in the layout, copy them into outline configuration.
        $atoms = $this->atoms();
        if (is_array($atoms) && $cascade) {
                // Save layout into custom directory for the current theme.
                $filename = $locator->findResource("genesis-config://{$name}/page/head.yaml", true, true);

                $file = YamlFile::instance($filename);
                $config = new Config($file->content());

                $file->save($config->set('atoms', json_decode(json_encode($atoms), true))->toArray());
                $file->free();
        }

        // Remove atoms from the layout.
        foreach ($this->items as $key => $section) {
            if ($section->type === 'atoms') {
                unset ($this->items[$key]);
            }
        }

        // Make sure that base outline never uses inheritance.
        if ($name === 'default') {
            $this->inheritNothing();
        }

        $filename = $locator->findResource("genesis-config://{$name}/layout.yaml", true, true);
        $file = CompiledYamlFile::instance($filename);
        $file->settings(['inline' => 20]);
        $file->save(LayoutReader::store($this->preset, $this->items));
        $file->free();

        $this->timestamp = $file->modified();
        $this->exists = true;

        static::$instances[$this->name] = $this;

        return $this;
    }

    /**
     * @return array
     */
    public function export()
    {
        return LayoutReader::store($this->preset, $this->items);
    }

    /**
     * Save index.
     *
     * @param array|null $index
     * @return $this
     */
    public function saveIndex($index = null)
    {
        if (!$this->name) {
            throw new \LogicException('Cannot save unnamed layout');
        }

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage("Saving layout index for outline {$this->name}");
        }

        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];
        $filename = $locator->findResource("genesis-config://{$this->name}/index.yaml", true, true);
        $cache = $locator->findResource("genesis-cache://{$this->name}/compiled/yaml", true, true);
        $file = CompiledYamlFile::instance($filename);

        // Attempt to lock the file for writing.
        try {
            $file->content();
            $file->lock(false);
        } catch (\Exception $e) {
            // Another process has locked the file; we will check this in a bit.
        }

        $index = $index ?: $this->buildIndex();

        // If file wasn't already locked by another process, save it.
        if ($file->locked() !== false) {
            $file->setCachePath($cache)->settings(['inline' => 20]);
            $file->save($index);
            $file->unlock();
        }
        $file->free();

        static::$indexes[$this->name] = $index;

        return $this;
    }

    /**
     * @return array
     */
    public function getLayoutTypes()
    {
        return $this->layout;
    }

    /**
     * @param string $type
     * @return bool
     */
    public function isLayoutType($type)
    {
        return in_array($type, $this->layout, true);
    }

    /**
     * @param string $id
     * @return object|null
     */
    public function getParentId($id)
    {
        return isset($this->parents[$id]) ? $this->parents[$id] : null;
    }

    /**
     * @return array
     */
    public function references()
    {
        $this->init();

        return $this->references;
    }

    /**
     * @param string $type
     * @param string $subtype
     * @return array
     */
    public function referencesByType($type = null, $subtype = null)
    {
        $this->init();

        if (!$type) {
            return $this->types;
        }

        if (!$subtype) {
            return isset($this->types[$type]) ? $this->types[$type] : [];
        }

        return isset($this->types[$type][$subtype]) ? $this->types[$type][$subtype] : [];
    }

    /**
     * Return list of positions (key) with their titles (value).
     *
     * @return array Array of position => title
     */
    public function positions()
    {
        $positions = $this->referencesByType('position', 'position');

        $list = [];
        /** @var \stdClass $position */
        foreach($positions as $position) {
            if (!isset($position->attributes->key)) {
                continue;
            }
            $list[$position->attributes->key] = $position->title;
        }

        return $list;
    }

    /**
     * Return list of positions (key) with their titles (value).
     *
     * @return array Array of position => title
     */
    public function sections()
    {
        $list = [];
        foreach ($this->referencesByType('section') as $type => $sections) {
            foreach ($sections as $id => $section) {
                $list[$id] = $section->title;
            }
        }

        foreach ($this->referencesByType('offcanvas') as $type => $sections) {
            foreach ($sections as $id => $section) {
                $list[$id] = $section->title;
            }
        }

        return $list;
    }

    /**
     * Return list of particles with their titles.
     *
     * @param  bool  $grouped  If true, group particles by type.
     * @return array Array of position => title
     */
    public function particles($grouped = true)
    {
        $blocks = $this->referencesByType('block', 'block');

        $list = [];
        foreach ($blocks as $blockId => $block) {
            if (!empty($block->children)) {
                foreach ($block->children as $id => $particle) {
                    if (!empty($particle->layout) || in_array($particle->type, $this->layout, true)) {
                        continue;
                    }
                    if ($grouped) {
                        $list[$particle->subtype][$particle->id] = $particle->title;
                    } else {
                        $list[$particle->id] = $particle->title;
                    }
                }
            }
        }

        return $list;
    }

    /**
     * @param string $outline
     * @return array
     */
    public function inherit($outline = null)
    {
        $this->init();

        $list = [];
        foreach ($this->inherit as $name => $item) {
            if (isset($item->inherit->outline)) {
                if (isset($item->inherit->particle)) {
                    $list[$item->inherit->outline][$name] = $item->inherit->particle;
                } else {
                    $list[$item->inherit->outline][$name] = $name;
                }
            }
        }

        return $outline ? (!empty($list[$outline]) ? $list[$outline] : []) : $list;
    }

    /**
     * Return atoms from the layout.
     *
     * @return array|null
     *
     * (deprecated)
     */
    public function atoms()
    {
        $list   = null;

        $atoms = array_filter($this->items, static function ($section) {
            return $section->type === 'atoms' && !empty($section->children);
        });
        $atoms = array_shift($atoms);

        if (!empty($atoms->children)) {
            $list = [];
            foreach ($atoms->children as $grid) {
                if (!empty($grid->children)) {
                    foreach ($grid->children as $block) {
                        if (isset($block->children[0])) {
                            $item = $block->children[0];
                            $list[] = ['title' => $item->title, 'type' => $item->subtype, 'attributes' => $item->attributes];
                        }
                    }
                }
            }
        }

        return $list;
    }

    /**
     * @param string $id
     * @param bool $createIfNotExists
     * @return object|null
     */
    public function find($id, $createIfNotExists = true)
    {
        $this->init();

        if (!isset($this->references[$id])) {
            return $createIfNotExists ? (object)['id' => $id, 'inherit' => new \stdClass] : null;
        }

        return $this->references[$id];
    }

    /**
     * @param string $id
     * @return null
     */
    public function block($id)
    {
        $this->init();

        return isset($this->blocks[$id]) ? $this->blocks[$id] : null;
    }

    /**
     * @return $this
     */
    public function clearSections()
    {
        $this->items = $this->clearChildren($this->items);

        return $this;
    }

    /**
     * @param array $items
     * @return array
     */
    protected function clearChildren(&$items)
    {
        foreach ($items as $key => $item) {
            if (!empty($item->children)) {
                $this->children = $this->clearChildren($item->children);
            }

            if (empty($item->children) && in_array($item->type, ['grid', 'block', 'particle', 'position', 'spacer', 'system'], true)) {
                unset($items[$key]);
            }
        }

        return array_values($items);
    }

    /**
     * @param array $old
     * @return array
     */
    public function copySections(array $old)
    {
        $this->init();

        /** @var Layout $old */
        $oldLayout = new static('tmp', $old);

        $leftover = [];

        // Copy normal sections.
        $data = $oldLayout->referencesByType('section');

        if (isset($this->types['section'])) {
            $sections = $this->types['section'];

            $this->copyData($data, $sections, $leftover);
        }

        // Copy offcanvas.
        $data = $oldLayout->referencesByType('offcanvas');
        if (isset($this->types['offcanvas'])) {
            $offcanvas = $this->types['offcanvas'];

            $this->copyData($data, $offcanvas, $leftover);
        }

        // Copy atoms.
        $data = $oldLayout->referencesByType('atoms');
        if (isset($this->types['atoms'])) {
            $atoms = $this->types['atoms'];

            $this->copyData($data, $atoms, $leftover);
        }

        return $leftover;
    }

    /**
     * @return $this
     */
    public function inheritAll()
    {
        foreach ($this->references() as $item) {
            if (!empty($item->inherit->outline)) {
                continue;
            }
            if (!$this->isLayoutType($item->type)) {
                $item->inherit = (object) ['outline' => $this->name, 'include' => ['attributes', 'block']];
            } elseif ($item->type === 'section' || $item->type === 'offcanvas') {
                $item->inherit = (object) ['outline' => $this->name, 'include' => ['attributes', 'block', 'children']];
            }
        }

        $this->init(true);

        return $this;
    }

    /**
     * @return $this
     */
    public function inheritNothing()
    {
        foreach ($this->references() as $item) {
            unset($item->inherit);
        }

        $this->init(true);

        return $this;
    }

    /**
     * @param array $data
     * @param array $sections
     * @param array $leftover
     */
    protected function copyData(array $data, array $sections, array &$leftover)
    {
        foreach ($data as $type => $items) {
            /** @var \stdClass $item */
            foreach ($items as $item) {
                $found = false;
                if (isset($sections[$type])) {
                    foreach ($sections[$type] as $section) {
                        if ($section->id === $item->id) {
                            $found = true;
                            $section->inherit = $this->cloneData($item->inherit);
                            $section->children = $this->cloneData($item->children);
                            break;
                        }
                    }
                }
                if (!$found && !empty($item->children)) {
                    $leftover[$item->id] = $item->title;
                }
            }
        }
    }

    /**
     * Clone data which consists mixed set of arrays and stdClass objects.
     *
     * @param mixed $data
     * @return mixed
     */
    protected function cloneData($data)
    {
        if (!($isObject = is_object($data)) && !is_array($data)) {
            return $data;
        }

        $clone = [];

        foreach((array) $data as $key => $value) {
            if (is_object($value) || is_array($value)) {
                $clone[$key] = $this->cloneData($value);
            } else {
                $clone[$key] = $value;
            }
        }

        return $isObject ? (object) $clone : $clone;
    }

    /**
     * @param array $items
     */
    protected function cleanLayout(array $items)
    {
        /** @var \stdClass $item */
        foreach ($items as $item) {
            if (!empty($item->inherit->include)) {
                $include = $item->inherit->include;
                foreach ($include as $part) {
                    switch ($part) {
                        case 'attributes':
                            $item->attributes = new \stdClass();
                            break;
                        case 'block':
                            break;
                        case 'children':
                            $item->children = [];
                            break;
                    }
                }
            }
            if (!empty($item->children)) {
                $this->cleanLayout($item->children);
            }
        }
    }

    protected function initInheritance()
    {
        $index = null;
        if ($this->name) {
            $index = static::loadIndexFile($this->name);
        }

        $inheriting = $this->inherit();

        if (\GENESIS_DEBUGGER && $inheriting) {
            Debugger::addMessage(sprintf('Layout from outline %s inherits %s', $this->name, implode(', ', array_keys($inheriting))));
        }

        foreach ($inheriting as $outlineId => $list) {
            try {
                $outline = $this::instance($outlineId);
            } catch (\Exception $e) {
                // Outline must have been deleted.
                if (\GENESIS_DEBUGGER) {
                    Debugger::addMessage("Outline {$outlineId} is missing / deleted", 'error');
                }

                $outline = null;
            }
            foreach ($list as $id => $inheritId) {
                $item = $this->find($id);
                if (!$item) {
                    continue;
                }

                $inheritId = !empty($item->inherit->particle) ? $item->inherit->particle : $id;
                $inherited = $outline ? $outline->find($inheritId) : null;
                $include = !empty($item->inherit->include) ? (array) $item->inherit->include : [];

                foreach ($include as $part) {
                    switch ($part) {
                        case 'attributes':
                            // Deep clone attributes.
                            $item->attributes = isset($inherited->attributes) ? $this->cloneData($inherited->attributes) : new \stdClass();
                            break;
                        case 'block':
                            $block = $this->block($id);
                            if (isset($block->attributes)) {
                                $inheritBlock = $outline ? $this->cloneData($outline->block($inheritId)) : null;
                                $blockAttributes = $inheritBlock ?
                                    array_diff_key((array)$inheritBlock->attributes, ['fixed' => 1, 'columns' => 1]) : [];
                                $block->attributes = (object)($blockAttributes + (array)$block->attributes);
                            }
                            break;
                        case 'children':
                            if (!empty($inherited->children)) {
                                // Deep clone children.
                                $item->children = $this->cloneData($inherited->children);
                                $this->initReferences($item->children, $this->getParentId($id), null,
                                    ['outline' => $outlineId, 'include' => ['attributes', 'block']], $index);
                            } else {
                                $item->children = [];
                            }
                            break;
                    }
                }

                if (!$outline || !isset($inherited->attributes)) {
                    // Remove inheritance information if outline doesn't exist.
                    $item->inherit = new \stdClass();
                    unset($this->inherit[$item->id]);
                }
            }
        }
    }

    /**
     * @param array|null $items
     * @param object|null $parent
     * @param object|null $block
     * @param array|null $inherit
     * @param array|null $index
     */
    protected function initReferences(?array $items = null, $parent = null, $block = null, $inherit = null, ?array $index = null)
    {
        if ($items === null) {
            $items = $this->items;
            $this->references = [];
            $this->types = [];
            $this->inherit = [];
        }

        /** @var \stdClass $item */
        foreach ($items as $item) {
            if (is_object($item)) {
                $type = $item->type;
                $subtype = !empty($item->subtype) ? $item->subtype : $type;

                if ($block) {
                    $this->parents[$item->id] = $parent;
                }
                if ($block) {
                    $this->blocks[$item->id] = $block;
                }

                if ($inherit && !$this->isLayoutType($type)) {
                    $item->inherit = (object) $inherit;
                    $item->inherit->particle = $item->id;

                    if (isset($index['inherit'][$item->inherit->outline]) && ($newId = array_search($item->id, $index['inherit'][$item->inherit->outline], true))) {
                        $item->id = $newId;
                    } else {
                        $item->id = $this->id($type, $subtype);
                    }
                }

                if (isset($item->id)) {
                    if (isset($this->references[$item->id])) {
                        if ($type === 'block' || $type === 'grid') {
                            $item->id = $this->id($type, $subtype);
                        }
//                        elseif (null === $inherit) {
//                            throw new \RuntimeException('Layout reference conflict on #' . $item->id);
//                        }
                    }
                    $this->references[$item->id] = $item;
                    $this->types[$type][$subtype][$item->id] = $item;

                    if (!empty($item->inherit->outline)) {
                        $this->inherit[$item->id] = $item;
                    }
                } else {
                    $this->types[$type][$subtype][] = $item;
                }

                if (isset($item->children) && is_array($item->children)) {
                    $this->initReferences($item->children, $type === 'section' ? $item : $parent, $type === 'block' ? $item : null, $inherit, $index);
                }
            }
        }
    }

    /**
     * @param string $type
     * @param string|null $subtype
     * @param string|int $id
     * @return string
     */
    protected function id($type, $subtype = null, $id = null)
    {
        $result = [];
        if ($type !== 'particle') {
            $result[] = $type;
        }
        if ($subtype && ($subtype !== $type || $subtype === 'position')) {
            $result[] = $subtype;
        }
        $key = implode('-', $result);

        $key_id = $key . '-'. $id;
        if (!$id || isset($this->references[$key_id])) {
            do {
                $id = function_exists('wp_rand') ? wp_rand(1000, 9999) : mt_rand(1000, 9999);
                $key_id = $key . '-'. $id;
                if (!isset($this->references[$key_id])) {
                    break;
                }
            } while (true);
        }

        return $key_id;
    }

    /**
     * Prepare block width sizes.
     *
     * @return $this
     */
    public function prepareColumns()
    {
        $this->init();

        $this->calcColumnsRecursive($this->items);

        return $this;
    }

    /**
     * Recalculate nested block columns.
     *
     * @param array $items
     * @internal
     */
    protected function calcColumnsRecursive(array &$items)
    {
        foreach ($items as $item) {
            if (empty($item->children)) {
                continue;
            }

            $this->calcColumnsRecursive($item->children);
            $this->calcColumns($item->children);
        }
    }

    /**
     * Rebalance responsive column overrides (`attributes->columns[breakpoint]`)
     * so that, within each breakpoint independently, all sibling blocks that
     * carry an explicit override at that breakpoint sum to 12 columns.
     *
     * `columns`, like every other nested attribute value (e.g. `extra`), is
     * a plain PHP array once loaded; attributes themselves are cast to
     * stdClass, while nested values retain array syntax.
     *
     * Breakpoints are normalized independently on Bootstrap's 12-column grid. Only
     * breakpoints where 2+ siblings already have an explicit override are
     * touched — a block with no `columns` override at all is left alone, so
     * no data is fabricated for a breakpoint nothing was ever authored for.
     * See NUCLEUS_BOOTSTRAP_MIGRATION.md M2b.
     *
     * @param array $children
     * @internal
     */
    protected function calcColumns(array &$children)
    {
        foreach (['xs', 'sm', 'md', 'lg', 'xl'] as $breakpoint) {
            $dynamic = [];
            $fixedColumns = 0;
            $dynamicColumns = 0;

            foreach ($children as $child) {
                if ($child->type !== 'block' || empty($child->attributes->columns[$breakpoint])) {
                    continue;
                }

                $value = (int) $child->attributes->columns[$breakpoint];
                if (empty($child->attributes->fixed)) {
                    $dynamic[] = $child;
                    $dynamicColumns += $value;
                } else {
                    $fixedColumns += $value;
                }
            }

            // Need at least two overridden, non-fixed siblings to rebalance;
            // a lone override has nothing to sum against.
            if (count($dynamic) < 2 || $fixedColumns + $dynamicColumns === 12) {
                continue;
            }

            $available = max(0, 12 - $fixedColumns);
            $multiplier = $available / ($dynamicColumns ?: 1);
            $fraction = 0;
            foreach ($dynamic as $child) {
                // Carry fractions forward so integer rounding remains stable.
                $value = ($child->attributes->columns[$breakpoint] * $multiplier) + $fraction;
                $newValue = (int) max(1, min(12, round($value)));
                $fraction = $value - $newValue;
                $child->attributes->columns[$breakpoint] = $newValue;
            }
        }
    }

    /**
     * @param  string $name
     * @param  string|null $preset
     * @return static
     */
    public static function load($name, $preset = null)
    {
        if (!$name) {
            throw new \BadMethodCallException('Layout needs to have a name');
        }

        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $layout = null;
        $filename = $locator("genesis-config://{$name}/layout.yaml");

        // If layout file doesn't exists, figure out what preset was used.
        if (!$filename) {
            // Attempt to load the index file.
            $indexFile = $locator("genesis-config://{$name}/index.yaml");
            if ($indexFile || !$preset) {
                $index = static::loadIndex($name, true);
                $preset = $index['preset']['name'];
            }

            try {
                $layout = static::preset($preset);
            } catch (\Exception $e) {
                // Layout doesn't exist, do nothing.
            }
        } else {
            $layout = LayoutReader::read($filename);
        }

        return new static($name, $layout);
    }

    /**
     * @param string $name
     * @return array
     */
    protected static function loadIndexFile($name)
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        // Attempt to load the index file.
        $indexFile = $locator("genesis-config://{$name}/index.yaml");
        if ($indexFile) {
            $file = CompiledYamlFile::instance($indexFile);
            $index = (array)$file->content();
            $file->free();
        } else {
            $index = [];
        }

        return $index;
    }

    /**
     * @param  string $name
     * @param  bool   $autoSave
     * @return array
     */
    public static function loadIndex($name, $autoSave = false)
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $index = static::loadIndexFile($name);

        // Find out the currently used layout file.
        $layoutFile = $locator("genesis-config://{$name}/layout.yaml");
        if (!$layoutFile) {
            /** @var Outlines $outlines */
            $outlines = $genesis['outlines'];

            $preset = isset($index['preset']['name']) ? $index['preset']['name'] : $outlines->preset($name);
        }

        // Get timestamp for the layout file.
        $timestamp = $layoutFile ? filemtime($layoutFile) : 0;

        // If layout index file doesn't exist or is not up to date, rebuild it.
        if (empty($index['timestamp']) || $index['timestamp'] !== $timestamp || !isset($index['version']) || $index['version'] !== static::VERSION) {
            $layout = isset($preset) ? new static($name, static::preset($preset)) : static::instance($name);
            $layout->timestamp = $timestamp;

            if ($autoSave) {
                if (!$layout->timestamp) {
                    $layout->save();
                }
                $index = $layout->buildIndex();
                $layout->saveIndex($index);
            } else {
                $index = $layout->buildIndex();
            }
        }

        $index += [
            'name' => $name,
            'timestamp' => $timestamp,
            'preset' => [
                'name' => '',
                'image' => 'genesis-admin://images/layouts/default.png'
            ],
            'positions' => [],
            'sections' => [],
            'inherit' => []
        ];

        return $index;
    }

    /**
     * @param array|null $children
     */
    public function check(?array $children = null)
    {
        if ($children === null) {
            $children = $this->items;
        }

        foreach ($children as $item) {
            if (!$item instanceof \stdClass) {
                throw new \RuntimeException('Invalid layout element');
            }
            if (!isset($item->type)) {
                throw new \RuntimeException('Type missing');
            }
            if (!isset($item->subtype)) {
                throw new \RuntimeException('Subtype missing');
            }
            if (!isset($item->attributes)) {
                throw new \RuntimeException('Attributes missing');
            }
            if (!is_object($item->attributes)) {
                throw new \RuntimeException('Attributes not object');
            }
            if (isset($item->children)) {
                if (!is_array($item->children)) {
                    throw new \RuntimeException('Children not array');
                }
                $this->check($item->children);
            }
        }
    }
}
