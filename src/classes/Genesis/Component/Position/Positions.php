<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Position;

use Genesis\Component\Collection\Collection;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Framework\Outlines;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceIterator;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use DazzleSoftware\Toolbox\DI\Container;

/**
 * Class Positions
 * @package Genesis\Component\Position
 */
class Positions extends Collection
{
    /** @var array|Position[] */
    protected array $items = [];
    /** @var string */
    protected string $path = 'genesis-positions://';
    /** @var Container */
    protected Container $container;

    /**
     * Positions constructor.
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * @param string $path
     * @return $this
     * @throws \RuntimeException
     */
    public function load(string $path = 'genesis-positions://'): static
    {
        $this->path = $path;
        $positions = [];

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];
        if ($locator->findResource($path)) {
            /** @var UniformResourceIterator $iterator */
            $iterator = $locator->getIterator($path);

            /** @var UniformResourceIterator $info */
            foreach ($iterator as $info) {
            if (!$info->isFile() || $info->getExtension() !== 'yaml') {
                    continue;
                }

                $name = $info->getBasename('.yaml');
            $position = (array)CompiledYamlFile::instance($info->getPathname())->content();

                // Only use filesystem position if it it is properly set up.
            if (!empty($position)) {
                    $positions[$name] = new Position($name, $position);
                }
            }
        }

        /** @var Outlines $outlines */
        $outlines = $this->container['outlines'];

        // Add empty positions from the layouts.
        foreach ($outlines->positions() as $name => $title) {
            if (!isset($positions[$name])) {
                $positions[$name] = new Position($name, ['title' => $title]);
            }
        }

        ksort($positions);

        $this->items = $positions;

        return $this;
    }

    /**
     * Updates all positions with their modules from an array and saves them.
     *
     * @param array $data
     * @return $this
     */
    public function import(array $data): static
    {
        foreach ($data as $pos) {
            $list = [];
            $position = $pos['name'];
            foreach ($pos['modules'] as $item) {
                $name = !empty($item['id']) ? $item['id'] : '';

                if ($name && !empty($item['position'])) {
                    $module = $this[$item['position']]->get($name);

                    if ($position !== $item['position']) {
                        $module->delete();
                    }
                } else {
                    $module = new Module($name, $position);
                }
                $module->update($item)->save($name, $position);

                $list[] = $module;
            }

            $this[$pos['name']]->update($list)->save();
        }

        return $this;
    }

    /**
     * @param Position $item
     * @return $this
     */
    public function add(mixed $item): static
    {
        if ($item instanceof Position) {
            $this->items[$item->name] = $item;
        }

        return $this;
    }

    /**
     * @param string $title
     * @param string $id
     *
     * @return string
     * @throws \RuntimeException
     */
    public function create(string $title = 'Untitled', ?string $id = null): string
    {
        $name = strtolower(preg_replace('|[^a-z\d_-]|ui', '_', $id ?: $title));

        if (!$name) {
            throw new \RuntimeException('Position needs a name', 400);
        }

        $name = $this->findFreeName($name);

        $position = new Position($name, ['title' => $title]);
        $position->save();

        return $name;
    }

    /**
     * @param string $id
     * @param string $new
     *
     * @return string
     * @throws \RuntimeException
     */
    public function duplicate(string $id, ?string $new = null): string
    {
        if (!isset($this->items[$id])) {
            throw new \RuntimeException(sprintf("Duplicating Position failed: '%s' not found.", $id), 400);
        }

        $new = $this->findFreeName($new ? strtolower(preg_replace('|[^a-z\d_-]|ui', '_', $new)) : $id);

        $position = $this->items[$id];
        $new = $position->duplicate($new);

        return $new->name;
    }

    /**
     * @param string $id
     * @param string $new
     *
     * @return string
     * @throws \RuntimeException
     */
    public function rename(string $id, string $new): string
    {
        if (!isset($this->items[$id])) {
            throw new \RuntimeException(sprintf("Renaming Position failed: '%s' not found.", $id), 400);
        }

        $newId = strtolower(preg_replace('|[^a-z\d_-]|ui', '_', $new));

        if (isset($this->items[$newId])) {
            throw new \RuntimeException(sprintf("Renaming Position failed: '%s' already exists.", $newId), 400);
        }

        $position = $this->items[$id];
        $position->rename($newId);

        return $position->name;
    }

    /**
     * @param string $id
     *
     * @throws \RuntimeException
     */
    public function delete(string $id): void
    {
        if (!isset($this->items[$id])) {
            throw new \RuntimeException(sprintf("Deleting Position failed: '%s' not found.", $id), 400);
        }

        $position = $this->items[$id];
        $position->delete();
    }

    /**
     * Find unused name with number appended to it when duplicating an position.
     *
     * @param string $id
     *
     * @return string
     */
    protected function findFreeName(string $id): string
    {
        if (!isset($this->items[$id])) {
            return $id;
        }

        $name  = $id;
        $count = 0;
        if (preg_match('|^(?:_)?(.*?)(?:_(\d+))?$|u', $id, $matches)) {
            $matches += ['', '', ''];
            list (, $name, $count) = $matches;
        }

        $count = max(1, $count);

        do {
            $count++;
        } while (isset($this->items["{$name}_{$count}"]));

        return "{$name}_{$count}";
    }
}
