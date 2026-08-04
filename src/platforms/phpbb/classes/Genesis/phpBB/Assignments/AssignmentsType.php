<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\phpBB\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;
use Genesis\phpBB\Runtime;

/**
 * Class AssignmentsType
 * @package Genesis\phpBB\Assignments
 *
 * Assigns outlines by phpBB "page type", derived from the front controller script name
 * (index, viewforum, viewtopic, memberlist, search, ucp, mcp, posting, ...).
 */
class AssignmentsType implements AssignmentsInterface
{
    public $type = 'type';
    public $priority = 2;

    /** @var array Known phpBB front-controller page types and their labels. */
    protected static $pageTypes = [
        'index' => 'Forum Index',
        'viewforum' => 'View Forum',
        'viewtopic' => 'View Topic',
        'posting' => 'Posting',
        'memberlist' => 'Memberlist',
        'search' => 'Search',
        'faq' => 'FAQ',
        'ucp' => 'User Control Panel',
        'mcp' => 'Moderator Control Panel',
        'report' => 'Report Post',
        'feed' => 'Feed',
    ];

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules()
    {
        $rules[static::getCurrentPageType()] = $this->priority;

        return [$rules];
    }

    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function listRules($configuration)
    {
        $items = [];
        foreach (static::$pageTypes as $name => $label) {
            $items[] = ['name' => $name, 'label' => $label];
        }

        return [[
            'label' => 'Page Types',
            'items' => $items,
        ]];
    }

    /**
     * @return string
     */
    public static function getCurrentPageType()
    {
        if (!Runtime::isBooted()) {
            return 'index';
        }

        /** @var \phpbb\request\request $request */
        $request = Runtime::service('request');
        $script = (string) $request->server('SCRIPT_NAME', '');
        $name = pathinfo($script, PATHINFO_FILENAME);

        return $name && isset(static::$pageTypes[$name]) ? $name : 'index';
    }
}
