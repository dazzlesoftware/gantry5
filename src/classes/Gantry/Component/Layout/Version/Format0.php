<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Layout\Version;

/**
 * Read layout from Layout Manager yaml file.
 */
class Format0 extends Format1
{
    /**
     * @return array
     */
    public function load()
    {
        $data = &$this->data;

        $preset = isset($data['preset']) && is_array($data['preset']) ? $data['preset'] : [];

        $result = is_array($data['children']) ? $this->object($data['children']) : [];

        $invisible = [
            'offcanvas' => $this->parse('offcanvas', [], 0),
            'atoms' => $this->parse('atoms', [], 0)
        ];
        foreach ($result as $key => &$item) {
            if (isset($invisible[$item->type])) {
                $invisible[$item->type] = $item;
                unset($result[$key]);
            }
        }
        unset($item);

        $result += $invisible;

        $result = array_values($result);

        return ['preset' => $preset] + $result;
    }

    /**
     * @param array $items
     * @param bool $container
     * @return array
     */
    protected function object(array $items, $container = true)
    {
        foreach ($items as &$item) {
            $item = (object) $item;

            if (isset($item->attributes) && (is_array($item->attributes) || is_object($item->attributes))) {
                $item->attributes = (object) $item->attributes;
            } else {
                $item->attributes = (object) [];
            }

            if (!empty($item->children) && is_array($item->children)) {
                $item->children = $this->object($item->children, false);
            }

            $this->normalize($item, $container);
        }

        return $items;
    }
}
