<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\Uri;

/**
 * Class Site
 * @package Genesis\Framework
 */
class Site
{
    /** @var string */
    public string $theme;
    /** @var string */
    public string $url;
    /** @var string */
    public string $title;
    /** @var string */
    public string $description;

    public function __construct()
    {
        $grav = Grav::instance();

        /** @var Config $config */
        $config = $grav['config'];

        /** @var Uri $uri */
        $uri = $grav['uri'];

        $this->theme = (string) $config->get('system.theme');
        $this->url = (string) $uri->rootUrl();
        $this->title = (string) $config->get('site.title');
        $this->description = (string) $config->get('site.description');
    }
}
