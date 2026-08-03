<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Url\Url;
use Gantry\phpBB\Runtime;

/**
 * Class Page
 * @package Gantry\Framework
 */
class Page extends Base\Page
{
    /** @var string */
    public $outline;
    /** @var string */
    public $language;
    /** @var string */
    public $direction;

    /**
     * Page constructor.
     * @param Gantry $container
     */
    public function __construct($container)
    {
        parent::__construct($container);

        /** @var \phpbb\language\language $language */
        $language = Runtime::service('language');

        $this->outline = $container['configuration'];
        $this->language = substr($language->get_used_language(), 0, 2) ?: 'en';
        $this->direction = $language->lang('DIRECTION') === 'rtl' ? 'rtl' : 'ltr';
    }

    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = [])
    {
        /** @var \phpbb\symfony_request $request */
        $request = Runtime::service('symfony_request');
        $url = $request->getUri();

        $parts = Url::parse($url, true);
        $parts['vars'] = array_replace($parts['vars'], $args);

        return Url::build($parts);
    }

    /**
     * @return string
     */
    public function htmlAttributes()
    {
        $attributes = [
                'lang' => $this->language,
                'dir' => $this->direction
            ]
            + (array) $this->config->get('page.html', []);

        return $this->getAttributes($attributes);
    }

    /**
     * @param array $attributes
     * @return string
     */
    public function bodyAttributes($attributes = [])
    {
        return $this->getAttributes((array) $this->config->get('page.body.attribs', []), $attributes);
    }
}
