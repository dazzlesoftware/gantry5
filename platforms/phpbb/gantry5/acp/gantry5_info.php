<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\gantry5\acp;

class gantry5_info
{
    public function module()
    {
        return [
            'filename' => '\dazzlesoftware\gantry5\acp\gantry5_module',
            'title' => 'ACP_GANTRY5_TITLE',
            'modes' => [
                'main' => [
                    'title' => 'ACP_GANTRY5_TITLE',
                    'auth' => 'ext_dazzlesoftware/gantry5 && acl_a_board',
                    'cat' => ['ACP_GANTRY5_TITLE'],
                ],
            ],
        ];
    }
}
