<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\genesis;

/**
 * phpBB extension entry point.
 *
 * The Genesis Framework itself is bootstrapped lazily by event\listener, not here -- ext.php is
 * only used by phpBB's extension manager for enable/disable/purge lifecycle checks.
 */
class ext extends \phpbb\extension\base
{
    /**
     * @return bool
     */
    public function is_enableable()
    {
        return \phpbb_version_compare(PHPBB_VERSION, '3.3.0', '>=') && \version_compare(PHP_VERSION, '8.3.0', '>=');
    }
}
