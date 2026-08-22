<?php

declare(strict_types=1);
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Integration\BuddyPress;

defined('ABSPATH') || exit;

use Pimple\Container;
use Pimple\ServiceProviderInterface;
use Genesis\Component\Event\Event;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class BuddyPress
 * @package Genesis\WordPress\Integration
 */

class BuddyPress implements ServiceProviderInterface, EventSubscriberInterface
{
    /**
     * Enabler
     *
     * @return bool
     */
    public static function enabled(): bool {
        // Required BuddyPress version
        $req_bp_version = '2.6';

        return in_array('buddypress/bp-loader.php', \apply_filters('active_plugins', \get_option('active_plugins')), true)
            && version_compare(BP_VERSION, $req_bp_version, '>');
    }


    /**
     * Register services to Genesis DI. Needed if you want to access something globally or from Twig template.
     *
     * Example: {{ genesis.buddypress.do_something() }}
     *
     * @param Container $genesis
     */
    public function register(Container $genesis): void
    {
        $loader = $genesis['loader'];
        $loader->addClassMap(
            [
                'Genesis\\WordPress\\Assignments\\AssignmentsBuddyPress' => __DIR__ . '/Assignments.php'
            ]
        );
    }

    /**
     * Subscribe to Genesis events.
     *
     * @return array
     */
    public static function getSubscribedEvents(): array
    {
        return [
            'theme.init'        => ['onThemeInit', 0],
            'assignments.types' => ['onAssigmentsTypes', 0]
        ];
    }

    /**
     * Called from Theme::init()
     *
     * @param Event $event
     */
    public function onThemeInit(Event $event): void
    {
        \add_filter('genesis_assignments_page_context_array', ['Genesis\\WordPress\\Assignments\\AssignmentsBuddyPress', 'addPageContextItem']);
        \add_filter('genesis_assignments_page_context_rules', ['Genesis\\WordPress\\Assignments\\AssignmentsBuddyPress', 'addPageContextConditionals'], 10, 2);
    }

    /**
     * Called from Attachments::types()
     *
     * @param Event $event
     */
    public function onAssigmentsTypes(Event $event): void
    {
        $event->types[] = 'buddypress';
    }
}
