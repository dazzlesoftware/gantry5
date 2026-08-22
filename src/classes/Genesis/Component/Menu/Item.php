<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Menu;

use Genesis\Component\Serializable\Serializable;
use DazzleSoftware\Toolbox\ArrayTraits\ArrayAccessWithGetters;
use DazzleSoftware\Toolbox\ArrayTraits\Export;

/**
 * @property string|int $id
 * @property string|int|null $parent_id
 * @property string $type
 * @property string|null $path
 * @property string|null $alias
 * @property string|null $title
 * @property string|null $link
 * @property string $layout
 * @property string $target
 * @property string $dropdown
 * @property string $dropdown_hide
 * @property string $icon
 * @property string $image
 * @property string $subtitle
 * @property string $hash
 * @property string $class
 * @property bool $icon_only
 * @property bool $enabled
 * @property bool $visible
 * @property int $group
 * @property array $columns
 * @property array $columns_count
 * @property int $level
 * @property string $link_title
 * @property string $anchor_class
 * @property string $yaml_path
 * @property string $yaml_alias
 *
 * // TODO: MISSING DEFAULTS
 * @property int $browserNav
 * @property bool $menu_text
 */
class Item implements \ArrayAccess, \Iterator, \Serializable, \Countable, \JsonSerializable
{
    use ArrayAccessWithGetters, Export, Serializable;

    const VERSION = 2;

    /** @var array */
    public static array $defaults = [
        'id' => 0,
        'parent_id' => null,
        'type' => 'link',
        'path' => null,
        'alias' => null,
        'title' => null,
        'link' => null,
        'layout' => 'list',
        'target' => '_self',
        'dropdown' => '',
        'dropdown_hide' => false,
        'attributes' => [],
        'link_attributes' => [],
        'dropdown_dir' => 'right',
        'width' => 'auto',
        'rel' => '', // WP
        'icon' => '',
        'image' => '',
        'subtitle' => '',
        'hash' => '',
        'class' => '',
        'icon_only' => false,
        'enabled' => true,
        'visible' => true,
        'group' => 0,
        'columns' => [],
        'columns_count' => [],
        'level' => 0,
        'link_title' => '',
        'anchor_class' => '',
        'yaml_path' => null,
        'yaml_alias' => null,
        'tree' => []
    ];

    /** @var array */
    protected array $items;
    /** @var AbstractMenu */
    protected AbstractMenu $menu;
    /** @var array */
    protected array $groups = [];
    /** @var array */
    protected array $children = [];
    /** @var string */
    protected ?string $url = null;

    /**
     * Item constructor.
     * @param AbstractMenu $menu
     * @param array $item
     */
    public function __construct(AbstractMenu $menu, array $item = [])
    {
        $this->menu = $menu;
        $this->items = array_merge(static::$defaults, $item);
    }

    /**
     * @return array
     */
    public function __debugInfo(): array
    {
        return [
            'items' => $this->items,
            'groups' => $this->groups,
            'children' => $this->children,
            'url' => $this->url
        ];
    }

    /**
     * @return array|mixed
     */
    public function jsonSerialize(): array
    {
        return [
            'items' => $this->toArray(false),
            'groups' => $this->groups,
            'children' => $this->children,
            'url' => $this->url
        ];
    }

    /**
     * @param bool $includeCurrent
     * @return array
     */
    public function getEscapedTitles(bool $includeCurrent = true): array
    {
        $list = [];
        $current = $this;
        if ($includeCurrent) {
            do {
                $list[] = htmlspecialchars($current->title, ENT_COMPAT | ENT_HTML5, 'UTF-8');
                $current = $current->parent();
            } while ($current->id);
        } else {
            $list[] = '';
            while (($current = $current->parent()) && $current->id) {
                $list[] = htmlspecialchars($current->title, ENT_COMPAT | ENT_HTML5, 'UTF-8');
            }
        }

        return array_reverse($list);
    }

    /**
     * @return string
     */
    public function getDropdown(): string
    {
        if (!$this->items['dropdown']) {
            return count($this->groups()) > 1 ? 'fullwidth' : 'standard';
        }

        return $this->items['dropdown'];
    }

    /**
     * @return array
     */
    public function __serialize(): array
    {
        // TODO: need to create collection class to gather the sibling data.
        return [
            'version' => static::VERSION,
            'items' => $this->items,
            'groups' => $this->groups,
            'children' => $this->children,
            'url' => $this->url
        ];
    }

    /**
     * @param array $serialized
     */
    public function __unserialize(array $serialized): void
    {
        // TODO: need to create collection class to gather the sibling data.
        if (!isset($serialized['version']) || (int) $serialized['version'] !== static::VERSION) {
            throw new \UnexpectedValueException('Serialized data is not valid');
        }

        $this->items = (array) $serialized['items'];
        $this->groups = (array) $serialized['groups'];
        $this->children = (array) $serialized['children'];
        $this->url = isset($serialized['url']) ? (string) $serialized['url'] : null;
    }

    /**
     * @param  string|null|bool $url
     * @return string
     */
    public function url(string|null|false $url = false): ?string
    {
        if ($url !== false) {
            $this->url = $url;
        }

        return $this->url;
    }

    /**
     * @return AbstractMenu
     * @TODO Need to break relationship to the menu and use a collection instead.
     */
    protected function menu(): AbstractMenu
    {
        return $this->menu;
    }

    /**
     * @return Item|null
     */
    public function parent(): ?Item
    {
        return $this->menu()[$this->items['parent_id']];
    }

    /**
     * @param string|int $column
     * @return float|int
     */
    public function columnWidth(string|int $column): float|int
    {
        if (isset($this->items['columns'][$column])) {
            return $this->items['columns'][$column];
        }

        return 100 / count($this->groups());
    }

    /**
     * Return a Bootstrap column span for a menu column.
     *
     * @param string|int $column
     * @return int
     */
    public function columnSpan(string|int $column): int
    {
        return max(1, min(12, (int) round($this->columnWidth($column) / 100 * 12)));
    }

    /**
     * @return array
     */
    public function groups(): array
    {
        $menu = $this->menu();

        // Grouped by column counts.
        if ($this->items['columns_count']) {
            $children = $this->children;

            $i = 0; $start = 0;
            $list = [];
            foreach ($this->items['columns_count'] as $i => $count) {
                $list[$i] = array_slice($children, $start, $count, true);
                $start += $count;
            }
            // Add missing items into the end of the list.
            if (count($children) > $start) {
                $list[$i] = array_merge($list[$i], array_slice($children, $start, null, true));
            }

            foreach ($list as &$items) {
                foreach ($items as $id => &$item) {
                    $item = $menu[$id];
                }
                unset($item);

                $items = array_filter($items);
            }
            unset($items);

            return $list;
        }

        // Grouped by explicit list.
        if ($this->groups) {
            $list = [];
            foreach ($this->groups as $i => $group) {
                $list[$i] = [];
                foreach ($group as $id => $value) {
                    $item = $menu[$id];
                    if ($item) {
                        $list[$i][] = $item;
                    }
                }
            }

            return $list;
        }

        // No grouping.
        return [$this->children()];
    }

    /**
     * @return array
     */
    public function children(): array
    {
        $list = [];
        foreach ($this as $child) {
            $list[] = $child;
        }

        return $list;
    }

    /**
     * @return bool
     */
    public function hasChildren(): bool
    {
        return !empty($this->children());
    }

    /**
     * @param int $i
     * @return array
     */
    public function getGroup(int $i): array
    {
        $groups = $this->groups();
        $i = (int) $i;

        return isset($groups[$i]) ? $groups[$i] : [];
    }

    /**
     * @param array $data
     * @return $this
     */
    public function update(array $data): static
    {
        $this->items = array_replace($this->items, $data);

        return $this;
    }

    /**
     * @param Item $child
     * @return $this
     */
    public function addChild(Item $child): static
    {
        $child->level = $this->level + 1;
        $child->parent_id = $this->id;
        $child->path = $this->path ? "{$this->path}/$child->alias" : $child->alias;
        if (isset($child->yaml_alias)) {
            $child->yaml_path = $this->yaml_path ? "{$this->yaml_path}/$child->yaml_alias" : $child->yaml_alias;
        }
        $this->children[$child->id] = $child->alias;

        return $this;
    }

    /**
     * @param Item $child
     * @return $this
     */
    public function removeChild(Item $child): static
    {
        unset($this->children[$child->id]);

        return $this;
    }

    /**
     * @param array|null $ordering
     * @return $this
     */
    public function sortChildren(array|string|null $ordering): static
    {
        // Array with keys that point to the items.
        $children =& $this->children;

        if ($children) {
            if (is_array($ordering)) {
                // Remove extra items from ordering and reorder.
                $children = array_replace(array_intersect_key($ordering, $children), $children);
            } else {
                switch ((string) $ordering) {
                    case 'abc':
                        // Alphabetical ordering.
                        ksort($children, SORT_NATURAL);
                        break;
                    case 'cba':
                        // Reversed alphabetical ordering.
                        krsort($children, SORT_NATURAL);
                        break;
                }
            }
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function reverse(): static
    {
        $this->children = array_reverse($this->children, true);
        $this->groups = array_reverse($this->groups, true);

        return $this;
    }

    /**
     * @param array $groups
     * @return $this
     */
    public function groupChildren(array $groups): static
    {
        // Array with keys that point to the items.
        $children = $this->children;

        if ($children) {
            $menu = $this->menu();
            $ordered = [];

            // Create empty groups.
            $this->groups = array_fill(0, max(1, count($this->items['columns'])), []);

            foreach ($groups as $i => $ordering) {
                if (!is_array($ordering)) {
                    continue;
                }

                // Get the items for this group with proper ordering.
                $group = [];
                foreach ($ordering as $key => $dummy) {
                    if (isset($children[$key])) {
                        $group[$key] = $children[$key];

                        // Assign each menu items to the group.
                        $item = $menu[$key];
                        if ($item) {
                            $item->group = $i;
                        }
                    }
                }

                // Update remaining children.
                $children = array_diff_key($children, $ordering);

                // Build child ordering.
                $ordered += $group;

                // Add items to the current group.
                $this->groups[$i] = $group;
                $this->items['columns_count'][$i] = count($group);
            }

            if ($children) {
                // Add leftover children to the ordered list and to the first group.
                $ordered += $children;
                $this->groups[0] += $children;
                $this->items['columns_count'][0] = count($this->groups[0]);
            }

            // Reorder children by their groups.
            $this->children = $ordered;
        }

        return $this;
    }

    // Implements \Iterator

    /**
     * Returns the current child.
     *
     * @return Item
     */
    public function current(): ?Item
    {
        $current = key($this->children);

        return $this->menu()[$current];
    }

    /**
     * Returns the key of the current child.
     *
     * @return mixed  Returns scalar on success, or NULL on failure.
     */
    public function key(): mixed
    {
        return current($this->children);
    }

    /**
     * Moves the current position to the next child.
     *
     * @return void
     */
    public function next(): void
    {
        while (false !== next($this->children)) {
            if ($this->current()) {
                break;
            }
        }
    }

    /**
     * Rewinds back to the first child.
     *
     * @return void
     */
    public function rewind(): void
    {
        reset($this->children);
        $current = key($this->children);
        if (!$this->menu()[$current]) {
            $this->next();
        }
    }

    /**
     * Count number of children.
     *
     * @return int
     */
    public function count(): int
    {
        return count($this->children());
    }

    /**
     * This method is called after Iterator::rewind() and Iterator::next() to check if the current position is valid.
     *
     * @return bool  Returns TRUE on success or FALSE on failure.
     */
    public function valid(): bool
    {
        return key($this->children) !== null;
    }

    /**
     * Convert object into an array.
     *
     * @param bool $withDefaults
     * @param array $ignore
     * @return array
     */
    public function toArray(bool $withDefaults = true, array $ignore = []): array
    {
        return $withDefaults ? $this->items : static::normalize($this->items, $ignore);
    }

    /**
     * @param array $array
     * @param array $ignore
     * @param bool $keepDefaults
     * @return array
     */
    public static function normalize(array $array, array $ignore = [], bool $keepDefaults = false): array
    {
        // Particles have no link.
        if (isset($array['type']) && $array['type'] === 'particle') {
            unset($array['link']);
        }

        // Remove yaml specific variables if there's no need for them.
        if (array_key_exists('yaml_path', $array) && $array['yaml_path'] === $array['path']) {
            unset($array['yaml_path']);
        }
        if (array_key_exists('yaml_alias', $array) && $array['yaml_alias'] === $array['alias']) {
            unset($array['yaml_alias']);
        }

        // Check if variable should be ignored.
        $ignore = array_flip($ignore) + ['tree' => true];
        foreach ($array as $var => $val) {
            if (isset($ignore[$var])) {
                unset($array[$var]);
            }
        }

        $defaults = static::$defaults;
        foreach ($defaults as $var => $default) {
            if (array_key_exists($var, $array)) {
                // Convert boolean values.
                if (is_bool($default)) {
                    $array[$var] = (bool)$array[$var];
                }

                // Ignore default values (do not distinct variable type).
                if ($array[$var] == $default) {
                    if ($keepDefaults) {
                        $array[$var] = $default;
                    } else {
                        unset($array[$var]);
                    }
                }
            }
        }

        return $array;
    }
}
