<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\genesis\migrations;

class genesis_acp_module extends \phpbb\db\migration\migration
{
    public static function depends_on()
    {
        return ['\phpbb\db\migration\data\v33x\v3311'];
    }

    public function effectively_installed()
    {
        return $this->db_tools->sql_table_exists($this->table_prefix . 'modules')
            && $this->module_exists('\dazzlesoftware\genesis\acp\genesis_module');
    }

    /**
     * @param string $basename
     * @return bool
     */
    protected function module_exists($basename)
    {
        $sql = 'SELECT module_id FROM ' . $this->table_prefix . "modules
			WHERE module_basename = '" . $this->db->sql_escape($basename) . "'";
        $result = $this->db->sql_query($sql);
        $row = $this->db->sql_fetchrow($result);
        $this->db->sql_freeresult($result);

        return (bool) $row;
    }

    public function update_data()
    {
        return [
            ['module.add', [
                'acp',
                'ACP_BOARD_CONFIGURATION',
                [
                    'module_basename' => '\dazzlesoftware\genesis\acp\genesis_module',
                    'modes' => ['main'],
                ],
            ]],
        ];
    }
}
