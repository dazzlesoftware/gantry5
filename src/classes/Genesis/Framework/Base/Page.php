<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Base;

use Genesis\Component\Config\Config;

/**
 * Class Page
 * @package Genesis\Framework\Base
 */
abstract class Page
{
    /** @var \Genesis\Framework\Genesis */
    protected $container;
    /** @var Config */
    protected $config;

    /**
     * Page constructor.
     * @param \Genesis\Framework\Genesis $container
     */
    public function __construct($container)
    {
        $this->container = $container;
        $this->config = $container['config'];
    }

    /**
     * @return string
     */
    public function doctype()
    {
        return $this->config->get('page.doctype', 'html');
    }

    /**
     * @param array $args
     * @return string
     */
    abstract public function url(array $args = []);

    /**
     * @return string
     */
    public function preset()
    {
        /** @var Theme $theme */
        $theme = $this->container['theme'];
        return 'g-' . preg_replace('/[^a-z0-9-]/', '', $theme->type());
    }

    /**
     * @return string
     */
    public function htmlAttributes()
    {
        return $this->getAttributes($this->config->get('page.html'));
    }

    /**
     * @param array $attributes
     * @return string
     */
    public function bodyAttributes($attributes = [])
    {
        return $this->getAttributes($this->config->get('page.body.attribs'), $attributes);
    }

    /**
     * @param array $params
     * @param array $extra
     * @return string
     */
    protected function getAttributes($params, $extra = [])
    {
        $params = array_merge_recursive($params, $extra);

        $list = [];
        foreach ($params as $param => $value) {
            if (!$value) { continue; }
            if (!is_array($value) || !count(array_filter($value, 'is_array'))) {
                $value = array_filter(array_unique((array) $value));
                $list[] = $param . '="' . implode(' ', $value) . '"';
            } else {
                $values = new \RecursiveIteratorIterator(new \RecursiveArrayIterator($value));
                foreach ($values as $iparam => $ivalue) {
                    $ivalue = array_filter(array_unique((array) $ivalue));
                    $list[] = $iparam . '="' . implode(' ', $ivalue) . '"';
                }
            }

        }

        return $list ? ' ' . implode(' ', $list) : '';
    }
}
