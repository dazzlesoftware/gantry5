<?php

declare(strict_types=1);
// phpcs:disable WordPress.WP.AlternativeFunctions.rand_mt_rand

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Position;

use Genesis\Component\Collection\Collection;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Component\Filesystem\Folder;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Symfony\Component\Yaml\Yaml;

/**
 * Class Position
 * @package Genesis\Component\Position
 */
class Position extends Collection
{
    /** @var string */
    public string $name;
    /** @var string */
    public string $title;
    /** @var array */
    protected array $modules = [];

    /**
     * Position constructor.
     *
     * @param string $name
     * @param array $items
     */
    public function __construct(string $name, ?array $items = null)
    {
        $this->name = $name;

        $this->load($items);
    }

    /**
     * Save position.
     *
     * @return $this
     */
    public function save(): static
    {
        $file = $this->file(true);
        $file->save($this->toArray());

        return $this;
    }

    /**
     * Clone position together with its modules. Returns new position.
     *
     * @param string $name
     * @return static
     */
    public function duplicate(string $name): static
    {
        $new = clone $this;
        $new->name = $name;
        $new->save();

        foreach ($this as $module) {
            $clone = clone $module;
            $clone->position = $name;
            $clone->save();
        }

        return $new;
    }

    /**
     * Raname module key
     *
     * @param string $name
     * @return static
     */
    public function rename(string $name): static
    {
        $new = $this->duplicate($name);
        $this->delete();

        return $new;
    }

    /**
     * Delete position.
     *
     * @return $this
     */
    public function delete(): static
    {
        $file = $this->file(true);
        if ($file->exists()) {
            $file->delete();
        }

        $folder = $this->folder(true);
        if (is_dir($folder)) {
            Folder::delete($folder);
        }

        return $this;
    }

    /**
     * Update modules in the position.
     *
     * @param array $items
     * @return $this
     */
    public function update(array $items): static
    {
        $list = [];
        foreach ($items as $item) {
            $name = ($item instanceof Module) ? $item->name : (string) $item;

            $list[] = $name;
            if (!in_array($name, $this->items, true)) {
                $this->add($item);
            }
        }

        $remove = array_diff($this->items, $list);
        foreach ($remove as $item) {
            $module = $this->get($item);
            if ($module->position === $this->name) {
                $module->delete();
            }
        }

        $this->items = $list;

        return $this;
    }

    /**
     * @param Module|string $item
     * @param string        $name  Temporary name for the module.
     * @return $this
     */
    public function add(mixed $item, ?string $name = null): static
    {
        if ($item instanceof Module) {
            $this->modules[$name ?: $item->name] = $item;
            $item = $name ?: $item->name;
        }

        $this->items[] = (string) $item;

        return $this;
    }

    /**
     * @param array|Module $item
     * @return $this
     */
    public function remove(mixed $item): static
    {
        if ($item instanceof Module) {
            $item = $item->name;
        }

        $item = (string) $item;

        unset($this->modules[$item]);

        $this->items = array_diff($this->items, [$item]);

        return $this;
    }

    /**
     * @param string $name
     * @return Module
     */
    public function get(string $name): Module
    {
        if (!isset($this->modules[$name])) {
            $this->modules[$name] = $this->loadModule($name);
        }

        return $this->modules[$name];
    }

    /**
     * Returns the value at specified offset.
     *
     * @param string $offset  The offset to retrieve.
     * @return bool
     */
    public function offsetExists(mixed $offset): bool
    {
        return isset($this->items[$offset]);
    }

    /**
     * Returns the value at specified offset.
     *
     * @param string $offset  The offset to retrieve.
     * @return Module|null
     */
    public function offsetGet(mixed $offset): ?Module
    {
        if (!isset($this->items[$offset])) {
            return null;
        }

        $name = $this->items[$offset];

        if (!isset($this->modules[$name])) {
            $this->modules[$name] = $this->loadModule($name);
        }

        return $this->modules[$name];
    }

    /**
     * Assigns a value to the specified offset.
     *
     * @param mixed $offset  The offset to assign the value to.
     * @param mixed $value   The value to set.
     */
    public function offsetSet(mixed $offset, mixed $value): void
    {
        if (!$value instanceof Module) {
            throw new \InvalidArgumentException('Value has to be an instance of Module');
        }
        if (null === $offset) {
            $this->items[] = $value->name;
            $this->modules[$value->name] = $value;
        } else {
            $this->items[$offset] = $value->name;
            $this->modules[$value->name] = $value;
        }
    }

    /**
     * Unsets an offset.
     *
     * @param mixed $offset  The offset to unset.
     */
    public function offsetUnset(mixed $offset): void
    {
        if (!isset($this->items[$offset])) {
            return;
        }

        $name = $this->items[$offset];
        parent::offsetUnset($offset);

        if (isset($this->modules[$name])) {
            unset($this->modules[$name]);
        }
    }

    /**
     * @return \ArrayIterator
     */
    public function getIterator(): \ArrayIterator
    {
        $items = [];
        foreach ($this->items as $key => $name) {
            $items[] = $this->offsetGet($key);
        }

        return new \ArrayIterator($items);
    }

    /**
     * @param bool $includeModules
     * @return array
     */
    public function toArray(bool $includeModules = false): array
    {
        $array = [
            'name' => $this->name,
            'title' => $this->title,
        ];

        if (!$includeModules) {
            $array['ordering'] = $this->items;

        } else {
            $list = [];
            foreach ($this->getIterator() as $key => $module) {
                $list[$key] = $module->toArray();
            }
            $array['modules'] = $list;
        }

        return $array;
    }

    /**
     * @param int $inline
     * @param int $indent
     * @param bool $includeModules
     * @return string
     */
    public function toYaml(mixed $inline = 3, mixed $indent = 2, bool $includeModules = false): string
    {
        return Yaml::dump($this->toArray($includeModules), (int) $inline, (int) $indent);
    }

    /**
     * @param bool $includeModules
     * @return string
     */
    public function toJson(bool $includeModules = false): string
    {
        return json_encode($this->toArray($includeModules), JSON_THROW_ON_ERROR);
    }

    /**
     * @return array
     */
    public function listModules(): array
    {
        $list = [];
        foreach ($this->items as $name) {
            $list[] = "{$this->name}/{$name}";
        }

        return $list;
    }

    /**
     * @param bool $save
     * @return string
     */
    public function folder(bool $save = false): string
    {
        return $this->locator()->findResource($this->path(), true, $save);
    }

    /**
     * @param array|null $data
     */
    protected function load(?array $data): void
    {
        if ($data === null) {
            $file = $this->file();
            $data = (array)$file->content();
            $file->free();
        }

        $this->title = isset($data['title']) ? $data['title'] : $this->name;

        if (isset($data['modules'])) {
            foreach ($data['modules'] as $array) {
                $temporaryName = $array['id'] ?: (function_exists('wp_rand') ? wp_rand() : mt_rand());
                $this->add(new Module($array['id'], $this->name, $array), (string) $temporaryName);
            }

            return;
        }

        // Sort modules by ordering, if items are not listed in ordering, use alphabetical order.
        $ordering = isset($data['ordering']) ? array_flip($data['ordering']) : [];
        $path = $this->locator()->findResource($this->path());
        $files = $path ? Folder::all(
            $path,
            [
                'compare' => 'Filename',
                'pattern' => '|\.yaml$|',
                'folders' => false,
                'recursive' => false,
                'key' => 'Filename',
                'filters' => ['key' => '|\.yaml$|']
            ]
        ) : [];
        ksort($files);
        $this->items = array_keys($ordering + $files);
    }

    /**
     * @param  string $name
     * @return Module
     */
    protected function loadModule(string $name): Module
    {
        return new Module($name, $this->name);
    }

    /**
     * @param bool $save
     * @return CompiledYamlFile
     */
    protected function file(bool $save = false): CompiledYamlFile
    {
        return CompiledYamlFile::instance($this->locator()->findResource($this->path() . '.yaml', true, $save));
    }

    /**
     * @return UniformResourceLocator
     */
    protected function locator(): UniformResourceLocator
    {
        return Genesis::instance()['locator'];
    }

    /**
     * @return string
     */
    protected function path(): string
    {
        return "genesis-positions://{$this->name}";
    }

}
