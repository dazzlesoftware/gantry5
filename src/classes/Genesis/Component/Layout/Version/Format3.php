<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Layout\Version;

/**
 * Bootstrap column based compact layout format.
 *
 * Format 3 keeps Format 2's compact YAML structure, but the number appended
 * to a block is a Bootstrap span from 1 to 12 instead of a percentage. The
 * runtime uses the responsive `columns` map directly.
 */
class Format3 extends CompactFormat
{
    /**
     * @return array
     */
    public function load()
    {
        $result = parent::load();

        foreach ($result as $key => $item) {
            if ($key === 'preset') {
                continue;
            }

            $this->loadColumns($item);
        }

        return $result;
    }

    /**
     * @param array $preset
     * @param array $structure
     * @return array
     */
    public function store(array $preset, array $structure)
    {
        $structure = json_decode(json_encode($structure), true);
        $this->storeColumns($structure);

        $result = parent::store($preset, $structure);
        $result['version'] = 3;

        return $result;
    }

    /**
     * Convert compact v3 spans into runtime column maps.
     *
     * @param object $item
     * @return void
     */
    protected function loadColumns($item)
    {
        if (!is_object($item)) {
            return;
        }

        if ($item->type === 'block') {
            $existing = isset($item->attributes->columns)
                ? (array) $item->attributes->columns
                : [];
            $span = !empty($existing['xs']) ? (int) $existing['xs'] : 12;
            $span = max(1, min(12, $span));

            $existing['xs'] = $span;
            $item->attributes->columns = $existing;
        }

        foreach ($item->children ?? [] as $child) {
            $this->loadColumns($child);
        }
    }

    /**
     * Replace runtime percentages with compact v3 spans before Format 2's
     * serializer embeds them into layout strings.
     *
     * @param array $item
     * @return void
     */
    protected function storeColumns(array &$item)
    {
        if (($item['type'] ?? null) === 'block') {
            $span = !empty($item['attributes']['columns']['xs'])
                ? (int) $item['attributes']['columns']['xs']
                : 12;
            $span = max(1, min(12, $span));

            $item['attributes']['columns']['xs'] = $span;
        }

        foreach ($item['children'] ?? [] as &$child) {
            $this->storeColumns($child);
        }
        unset($child);
    }

    /**
     * Format 3 embeds the Bootstrap xs span, not a percentage.
     *
     * @param array $attributes
     * @return int|null
     */
    protected function getCompactWidth(array $attributes)
    {
        $span = (int) ($attributes['columns']['xs'] ?? 12);

        return $span === 12 ? null : max(1, min(12, $span));
    }
}
