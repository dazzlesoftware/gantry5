<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\WordPress\Integration\WooCommerce;

defined('ABSPATH') || exit;

use Pimple\Container;
use Pimple\ServiceProviderInterface;
use Dazzle Software\Toolbox\Event\Event;
use Dazzle Software\Toolbox\Event\EventSubscriberInterface;

/**
 * Class WooCommerce
 * @package Gantry\WordPress\Integration
 */

class WooCommerce implements ServiceProviderInterface, EventSubscriberInterface
{
    /**
     * Enabler
     *
     * @return bool
     */
    public static function enabled()
    {
        if (in_array('woocommerce/woocommerce.php', \apply_filters('active_plugins', \get_option('active_plugins')), true)) {
            return true;
        }

        return false;
    }


    /**
     * Register services to Gantry DI. Needed if you want to access something globally or from Twig template.
     *
     * Example: {{ gantry.woocommerce.do_something() }}
     *
     * @param Container $gantry
     */
    public function register(Container $gantry)
    {
        $loader = $gantry['loader'];
        $loader->addClassMap(
            [
                'Gantry\\WordPress\\Assignments\\AssignmentsWoocommerce' => __DIR__ . '/Assignments.php'
            ]
        );
    }

    /**
     * Subscribe to Gantry events.
     *
     * @return array
     */
    public static function getSubscribedEvents()
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
    public function onThemeInit(Event $event)
    {
        \add_theme_support('woocommerce');

        \add_filter('gantry5_assignments_page_context_array', ['Gantry\\WordPress\\Assignments\\AssignmentsWoocommerce', 'addPageContextItem']);
        \add_filter('gantry5_assignments_page_context_rules', ['Gantry\\WordPress\\Assignments\\AssignmentsWoocommerce', 'addPageContextConditionals'], 10, 2);
    }

    /**
     * Called from Attachments::types()
     *
     * @param Event $event
     */
    public function onAssigmentsTypes(Event $event)
    {
        $event->types[] = 'woocommerce';
    }
}
