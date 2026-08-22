<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Url\Url;
use Grav\Common\Grav;
use Grav\Common\Language\Language;
use Grav\Common\Language\LanguageCodes;
use Grav\Common\Page\Interfaces\PageInterface;

/**
 * Class Page
 * @package Genesis\Framework
 */
class Page extends Base\Page
{
    /** @var string */
    public string $theme = '';
    /** @var string */
    public string $baseUrl = '';
    /** @var string */
    public string $title = '';
    /** @var string */
    public string $description = '';
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

        $grav = Grav::instance();

        /** @var Language $language */
        $language = $grav['language'];

        $this->outline = (string) $container['configuration'];
        $this->language = $language->getLanguage() ?: 'en';
        $this->direction = (string) LanguageCodes::getOrientation($this->language);
    }

    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = []): string
    {
        $grav = Grav::instance();
        $url = $grav['uri']->url;

        $parts = Url::parse($url, true);
        $parts['vars'] = array_replace($parts['vars'], $args);

        return Url::build($parts);
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
        $grav = Grav::instance();

        /** @var PageInterface $page */
        $page = $grav['page'];

        $classes = [
            'site',
            $page ? $page->template() : '',
            "dir-$this->direction",
            "outline-{$this->outline}",
        ];

        $header = $page->header();
        if (!empty($header->body_classes)) {
            $classes[] = $header->body_classes;
        }
        $baseAttributes = (array) $this->config->get('page.body.attribs', []);
        if (!empty($baseAttributes['class'])) {
            $baseAttributes['class'] = array_merge((array) $baseAttributes['class'], $classes);
        } else {
            $baseAttributes['class'] = $classes;
        }

        return $this->getAttributes($baseAttributes, $attributes);
    }
}
