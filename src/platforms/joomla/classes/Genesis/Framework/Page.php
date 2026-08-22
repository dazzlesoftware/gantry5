<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;

/**
 * Class Page
 * @package Genesis\Framework
 */
class Page extends Base\Page
{
    /** @var bool */
    public bool $home = false;
    /** @var string */
    public string $outline;
    /** @var string */
    public string $language = 'en';
    /** @var string */
    public string $direction = 'ltr';

    // Joomla specific properties.
    /** @var string */
    public string $tmpl;
    /** @var string */
    public string $option;
    /** @var string */
    public string $view;
    /** @var string */
    public string $layout;
    /** @var string */
    public string $task;
    /** @var string */
    public string $theme;
    /** @var string */
    public string $baseUrl;
    /** @var string */
    public string $sitename;
    /** @var string */
    public string $title = '';
    /** @var string */
    public string $description = '';
    /** @var string */
    public string $class;
    /** @var string */
    public string $printing;
    /** @var int */
    public int $itemid;

    /**
     * Page constructor.
     * @param Genesis $container
     * @throws \Exception
     */
    public function __construct(Genesis $container)
    {
        parent::__construct($container);

        /** @var CMSApplication $application */
        $application = Factory::getApplication();
        $input = $application->input;

        $this->tmpl     = $input->getCmd('tmpl', '');
        $this->option   = $input->getCmd('option', '');
        $this->view     = $input->getCmd('view', '');
        $this->layout   = $input->getCmd('layout', '');
        $this->task     = $input->getCmd('task', '');
        $this->itemid   = $input->getInt('Itemid', 0);
        $this->printing = $input->getCmd('print', '');

        $this->class = '';
        if ($this->itemid) {
            $menu = $application->getMenu();
            $menuItem = $menu ? $menu->getActive() : null;
            if ($menuItem && $menuItem->id) {
                $this->home = (bool) $menuItem->home;
                $this->class = $menuItem->getParams()->get('pageclass_sfx', '');
            }
        }
        $templateParams = $application->getTemplate(true);
        $this->outline = (string) Genesis::instance()['configuration'];
        $this->sitename = (string) $application->get('sitename');
        $this->theme = (string) $templateParams->template;
        $this->baseUrl = Uri::base(true);

        // Document doesn't exist in error page if modern routing is being used.
        $document = isset($container['platform']->document) ? $container['platform']->document : $application->getDocument();
        if ($document) {
            $this->title = (string) $document->title;
            $this->description = (string) $document->description;

            // Document has lower case language code, which causes issues with some JS scripts (Snipcart). Use tag instead.
            $code = explode('-', $document->getLanguage(), 2);
            $language =  array_shift($code);
            $country = strtoupper(array_shift($code));
            $this->language = $language . ($country ? '-' . $country : '');
            $this->direction = (string) $document->direction;
        }
    }

    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = []): string
    {
        $url = Uri::getInstance();

        foreach ($args as $key => $val) {
            $url->setVar($key, $val);
        }

        return $url->toString();
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
        // Use modern Joomla class set for site and component pages (Joomla 5)
        $classes = ['site', $this->option, "view-{$this->view}"];
        $classes[] = $this->layout ? 'layout-' . $this->layout : 'no-layout';
        $classes[] = $this->task ? 'task-' . $this->task : 'no-task';
        $classes[] = 'dir-' . $this->direction;
        if ($this->class) $classes[] = $this->class;
        if ($this->printing) $classes[] = 'print-mode';
        if ($this->itemid) $classes[] = 'itemid-' . $this->itemid;
        if ($this->outline) $classes[] = 'outline-' . $this->outline;

        $baseAttributes = (array) $this->config->get('page.body.attribs', []);
        if (!empty($baseAttributes['class'])) {
            $baseAttributes['class'] = array_merge((array) $baseAttributes['class'], $classes);
        } else {
            $baseAttributes['class'] = $classes;
        }

        return $this->getAttributes($baseAttributes, $attributes);
    }
}
