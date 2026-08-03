<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\phpBB\Runtime;

/**
 * Class Gantry
 * @package Gantry\Framework
 */
class Gantry extends Base\Gantry
{
    /**
     * @return array
     */
    protected function loadGlobal()
    {
        /** @var \phpbb\config\config $config */
        $config = Runtime::service('config');

        $json = isset($config['gantry5_settings']) ? $config['gantry5_settings'] : '';
        $data = $json ? json_decode($json, true) : null;

        return \is_array($data) ? $data : [];
    }
}
