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
 * runtime percentage is mirrored while the remaining legacy layout code is
 * phased out.
 */
class Format3 extends Format2
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
     * Convert compact v3 spans into runtime column maps and legacy sizes.
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
            $span = !empty($existing['xs'])
                ? (int) $existing['xs']
                : (int) ($item->attributes->size ?? 12);
            $span = max(1, min(12, $span));

            $existing['xs'] = $span;
            $item->attributes->columns = (object) $existing;
            $item->attributes->size = $span / 12 * 100;
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
                : (int) round(((float) ($item['attributes']['size'] ?? 100)) / 100 * 12);
            $span = max(1, min(12, $span));

            $item['attributes']['columns']['xs'] = $span;
            $item['attributes']['size'] = $span;
        }

        foreach ($item['children'] ?? [] as &$child) {
            $this->storeColumns($child);
        }
        unset($child);
    }
}
