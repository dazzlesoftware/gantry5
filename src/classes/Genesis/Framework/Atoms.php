<?php
// phpcs:disable WordPress.WP.AlternativeFunctions.rand_mt_rand

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Config\BlueprintForm;
use Genesis\Component\Config\Config;
use Genesis\Component\File\CompiledYamlFile;
use DazzleSoftware\Toolbox\ArrayTraits\ArrayAccess;
use DazzleSoftware\Toolbox\ArrayTraits\Export;
use DazzleSoftware\Toolbox\ArrayTraits\ExportInterface;
use DazzleSoftware\Toolbox\ArrayTraits\Iterator;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Atoms
 * @package Genesis\Framework
 */
class Atoms implements \ArrayAccess, \Iterator, ExportInterface
{
    use ArrayAccess, Iterator, Export;

    /** @var string */
    protected $name;
    /** @var array */
    protected $items;
    /** @var array */
    protected $ids;
    /** @var bool */
    protected $inherit = false;

    /** @var static[] */
    protected static $instances;

    /**
     * @param string $outline
     * @return static
     */
    public static function instance($outline)
    {
        if (!isset(static::$instances[$outline])) {
            $file = CompiledYamlFile::instance("genesis-theme://config/{$outline}/page/head.yaml");
            $head = (array)$file->content();
            static::$instances[$outline] = new static(isset($head['atoms']) ? $head['atoms'] : [], $outline);
            $file->free();

            static::$instances[$outline]->init();
        }

        return static::$instances[$outline];
    }

    /**
     * Atoms constructor.
     * @param array $atoms
     * @param string $name
     */
    public function __construct(array $atoms = [], $name = null)
    {
        $this->name = $name;
        $this->items = array_filter($atoms);
        $this->inherit = file_exists('genesis-admin://blueprints/layout/inheritance/atom.yaml');

        foreach ($this->items as &$item) {
            if (!empty($item['id'])) {
                $this->ids[$item['id']] = $item;
            }
        }
    }

    /**
     * @return $this
     */
    public function init()
    {
        foreach ($this->items as &$item) {
            if (!empty($item['inherit']['outline']) && !empty($item['inherit']['atom'])) {
                $inherited = static::instance($item['inherit']['outline']);
                $test = $inherited->id($item['inherit']['atom']);
                if (isset($test['attributes'])) {
                    $item['attributes'] = $test['attributes'];
                } else {
                    unset($item['inherit']);
                }
            }
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function update()
    {
        foreach ($this->items as &$item) {
            if (empty($item['id'])) {
                $item['id'] = $this->createId($item);
            }
            if (!empty($item['inherit']['outline']) && !empty($item['inherit']['atom'])) {
                unset($item['attributes']);
            } else {
                unset($item['inherit']);
            }
        }

        return $this;
    }

    /**
     * @param string $outline
     * @return $this
     */
    public function inheritAll($outline)
    {
        foreach ($this->items as &$item) {
            if (!empty($item['id'])) {
                $item['inherit'] = [
                    'outline' => $outline,
                    'atom' => $item['id'],
                    'include' => ['attributes']
                ];
            }
        }

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

        foreach ($this->items as &$item) {
            if (!empty($item['inherit']['outline']) && $item['inherit']['outline'] === $old && isset($item['inherit']['atom'])) {
                if ($new && ($ids === null || isset($ids[$item['inherit']['atom']]))) {
                    $item['inherit']['outline'] = $new;
                } else {
                    unset($item['inherit']);
                }
            }
        }

        return $this;
    }

    public function save()
    {
        if ($this->name) {
            /** @var UniformResourceLocator $locator */
            $locator = Genesis::instance()['locator'];

            $loadPath = $locator->findResource("genesis-theme://config/{$this->name}/page/head.yaml");
            $savePath = $locator->findResource("genesis-theme://config/{$this->name}/page/head.yaml", true, true);

            if ($loadPath && $savePath) {
                $file = CompiledYamlFile::instance($loadPath);
                $head = (array)$file->content();
                $head['atoms'] = $this->update()->toArray();
                $file->free();

                $file = CompiledYamlFile::instance($savePath);
                $file->save($head);
                $file->free();
            }
        }
    }

    /**
     * @param string $id
     * @return array
     */
    public function id($id)
    {
        return isset($this->ids[$id]) ? $this->ids[$id] : [];
    }

    /**
     * @param string $type
     * @return array
     */
    public function type($type)
    {
        $list = [];
        foreach ($this->items as $item) {
            if ($item['type'] === $type) {
                $list[] = $item;
            }
        }

        return $list;
    }

    /**
     * @param string $type
     * @param array $data
     * @return Config
     */
    public function createAtom($type, array $data = [])
    {
        $self = $this;

        $callable = static function () use ($self, $type) {
            return $self->getBlueprint($type);
        };

        // Create configuration from the data.
        $item = new Config($data, $callable);
        $item->def('id', null);
        $item->def('type', $type);
        if (!isset($item['title'])) {
            $item->def('title', $item->blueprint()->get('name'));
        }
        $item->def('attributes', []);
        $item->def('inherit', []);

        return $item;
    }

    /**
     * @param string $type
     * @return BlueprintForm
     */
    public function getBlueprint($type)
    {
        $blueprint = BlueprintForm::instance($type, 'genesis-blueprints://particles');

        if ($this->inherit) {
            $blueprint->set('form/fields/_inherit', ['type' => 'genesis.inherit']);
        }

        return $blueprint;
    }

    /**
     * @param string $type
     * @param string $id
     * @param bool $force
     * @return BlueprintForm|null
     */
    public function getInheritanceBlueprint($type, $id = null, $force = false)
    {
        if (!$this->inherit) {
            return null;
        }

        $inheriting = $id ? $this->getInheritingOutlines($id) : [];
        $list = $this->getOutlines($type, false);

        if ($force || (empty($inheriting) && $list)) {
            $inheritance = BlueprintForm::instance('layout/inheritance/atom.yaml', 'genesis-admin://blueprints');
            $inheritance->set('form/fields/outline/filter', array_keys($list));
            $inheritance->set('form/fields/atom/atom', $type);

        } elseif (!empty($inheriting)) {
            // Already inherited by other outlines.
            $inheritance = BlueprintForm::instance('layout/inheritance/messages/inherited.yaml', 'genesis-admin://blueprints');
            $inheritance->set(
                'form/fields/_note/content',
                sprintf($inheritance->get('form/fields/_note/content'), 'atom', ' <ul><li>' . implode('</li> <li>', $inheriting) . '</li></ul>')
            );

        } elseif ($this->name === 'default') {
            // Base outline.
            $inheritance = BlueprintForm::instance('layout/inheritance/messages/default.yaml', 'genesis-admin://blueprints');

        } else {
            // Nothing to inherit from.
            $inheritance = BlueprintForm::instance('layout/inheritance/messages/empty.yaml', 'genesis-admin://blueprints');
        }

        return $inheritance;
    }

    /**
     * @param string $id
     * @return array
     */
    public function getInheritingOutlines($id = null)
    {
        /** @var Outlines $outlines */
        $outlines = Genesis::instance()['outlines'];

        return $outlines->getInheritingOutlinesWithAtom($this->name, $id);
    }

    /**
     * @param string $type
     * @param bool $includeInherited
     * @return array
     */
    public function getOutlines($type, $includeInherited = true)
    {
        if ($this->name !== 'default') {
            /** @var Outlines $outlines */
            $outlines = Genesis::instance()['outlines'];

            $list = $outlines->getOutlinesWithAtom($type, $includeInherited);
            unset($list[$this->name]);
        } else {
            $list = [];
        }

        return $list;
    }

    /**
     * @param array $item
     * @return string
     */
    protected function createId(array &$item)
    {
        $type = $item['type'];

        do {
            $num = function_exists('wp_rand') ? wp_rand(1000, 9999) : mt_rand(1000, 9999);
            if (!isset($this->ids["{$type}-{$num}"])) {
                break;
            }
        } while (true);

        $id = "{$type}-{$num}";

        $this->ids[$id] = $item;

        return $id;
    }
}
