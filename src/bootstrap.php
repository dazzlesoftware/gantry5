<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    if (!defined('_JEXEC') && !defined('GRAV_ROOT') && !defined('IN_PHPBB')) {
        exit;
    }
}

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

include __DIR__ . '/Loader.php';

return \Genesis\Loader::get();
