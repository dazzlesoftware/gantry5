<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\genesis\acp;

class genesis_info
{
    public function module()
    {
        return [
            'filename' => '\dazzlesoftware\genesis\acp\genesis_module',
            'title' => 'ACP_GENESIS_TITLE',
            'modes' => [
                'main' => [
                    'title' => 'ACP_GENESIS_TITLE',
                    'auth' => 'ext_dazzlesoftware/genesis && acl_a_board',
                    'cat' => ['ACP_GENESIS_TITLE'],
                ],
            ],
        ];
    }
}
