<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\phpBB\Runtime;

/**
 * Class Site
 * @package Genesis\Framework
 */
class Site
{
    /** @var string */
    public string $title;
    /** @var string */
    public string $description;
    /** @var string */
    public string $url;

    public function __construct()
    {
        /** @var \phpbb\config\config $config */
        $config = Runtime::service('config');

        /** @var \phpbb\path_helper $pathHelper */
        $pathHelper = Runtime::service('path_helper');

        $this->title = isset($config['sitename']) ? (string) $config['sitename'] : '';
        $this->description = isset($config['site_desc']) ? (string) $config['site_desc'] : '';
        $this->url = rtrim((string) $pathHelper->get_web_root_path(), '/');
    }
}
