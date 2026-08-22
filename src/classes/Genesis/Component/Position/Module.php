<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Position;

use Genesis\Component\File\CompiledYamlFile;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ArrayTraits\Export;
use DazzleSoftware\Toolbox\ArrayTraits\NestedArrayAccessWithGetters;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Module
 * @package Genesis\Component\Position
 */
class Module implements \ArrayAccess
{
    use NestedArrayAccessWithGetters, Export;

    /** @var string */
    public ?string $name;
    /** @var string|null */
    public ?string $position;
    /** @var string */
    public string $assigned;

    /** @var array */
    protected array $items = [];

    /**
     * Module constructor.
     *
     * @param string $name
     * @param string $position
     * @param array $data
     */
    public function __construct(string $name, ?string $position = null, ?array $data = null)
    {
        $this->name = $name;
        $this->position = $position;

        if ($data) {
            $this->init($data);
        } else {
            $this->load();
        }
    }

    /**
     * @param array $data
     * @return $this
     */
    public function update(array $data): static
    {
        $this->init($data);

        return $this;
    }

    /**
     * Save module.
     *
     * @param string $position
     * @param string $name
     * @return $this
     */
    public function save(?string $name = null, ?string $position = null): static
    {
        $this->name = $name ?: $this->name;
        $this->position = $position ?: $this->position;

        $items = $this->toArray();
        unset($items['position'], $items['id']);

        $file = $this->file(true);
        $file->save($items);

        return $this;
    }

    /**
     * Delete module.
     *
     * @return $this
     */
    public function delete(): static
    {
        $file = $this->file(true);
        if ($file->exists()) {
            $file->delete();
        }

        return $this;
    }

    /**
     * Return true if module exists.
     *
     * @return bool
     */
    public function exists(): bool
    {
        return $this->name ? $this->file()->exists() : false;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return  ['position' => $this->position, 'id' => $this->name] + $this->items;
    }

    protected function load(): void
    {
        $file = $this->file();
        $this->init((array)$file->content());
        $file->free();
    }

    /**
     * @param array $data
     */
    protected function init(array $data): void
    {
        unset($data['id'], $data['position']);

        $this->items = $data;

        if (isset($this->items['assignments'])) {
            $assignments = $this->items['assignments'];
            if (is_array($assignments)) {
                $this->assigned = 'some';
            } elseif ($assignments !== 'all') {
                $this->assigned = 'none';
            } else {
                $this->assigned = 'all';
            }
        } else {
            $this->assigned = 'all';
        }
    }

    /**
     * @param bool $save
     * @return CompiledYamlFile
     */
    protected function file(bool $save = false): CompiledYamlFile
    {
        $position = $this->position ?: '_unassigned_';

        $this->name = $this->name ?: ($save ? $this->findFreeName() : null);
        $name = $this->name ?: '_untitled_';

        /** @var UniformResourceLocator $locator */
        $locator = Genesis::instance()['locator'];

        return CompiledYamlFile::instance($locator->findResource("genesis-positions://{$position}/{$name}.yaml", true, $save));
    }

    /**
     * Find unused name with number appended.
     */
    protected function findFreeName(): string
    {
        $position = $this->position ?: '_unassigned_';
        $name = (string) $this->get('type');
        $name = $name === 'particle' ? (string) $this->get('options.type') : $name;

        /** @var UniformResourceLocator $locator */
        $locator = Genesis::instance()['locator'];

        if (!file_exists($locator->findResource("genesis-positions://{$position}/{$name}.yaml", true, true))) {
            return $name;
        }

        $count = 1;

        do {
            $count++;
        } while (file_exists($locator->findResource("genesis-positions://{$position}/{$name}_{$count}.yaml", true, true)));

        return "{$name}_{$count}";
    }
}
