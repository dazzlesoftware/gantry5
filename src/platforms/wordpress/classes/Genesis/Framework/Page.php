<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

/**
 * Class Page
 * @package Genesis\Framework
 */
class Page extends Base\Page
{
    /** @var string */
    public bool $home;
    /** @var string */
    public string $outline;
    /** @var string */
    public string $language;
    /** @var string */
    public string $direction;

    /**
     * Page constructor.
     * @param Genesis $container
     */
    public function __construct(Genesis $container)
    {
        parent::__construct($container);

        $site = Genesis::instance()['site'];

        $this->home = \is_front_page();
        $this->outline = (string) $container['configuration'];
        $this->language = str_replace('_', '-', (string)$site->language);
        $this->direction = function_exists('is_rtl') && is_rtl() ? 'rtl' : 'ltr';
    }

    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = []): string
    {
        return \home_url(\add_query_arg($args, $GLOBALS['wp']->request));
    }

    /**
     * @return string
     */
    public function htmlAttributes(): string
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
    public function bodyAttributes(array $attributes = []): string
    {
        // TODO: we might need something like
        // class="{{body_class}}" data-template="{{ twigTemplate|default('base.twig') }}"

        $body_classes = \apply_filters('genesis_body_classes', [
                'site',
                'outline-' . Genesis::instance()['configuration'],
                'dir-' . $this->direction
            ]);

        $wp_body_class = \get_body_class($body_classes);

        if(is_array($wp_body_class) && !empty($wp_body_class)) {
            $attributes['class'] = array_merge_recursive((array) ($attributes['class'] ?? []), $wp_body_class);
        }

        return $this->getAttributes((array) $this->config->get('page.body.attribs'), $attributes);
    }
}
