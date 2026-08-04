<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Integration\WooCommerce;

defined('ABSPATH') || exit;

use Pimple\Container;
use Pimple\ServiceProviderInterface;
use Genesis\Component\Event\Event;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class WooCommerce
 * @package Genesis\WordPress\Integration
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
     * Register services to Genesis DI. Needed if you want to access something globally or from Twig template.
     *
     * Example: {{ genesis.woocommerce.do_something() }}
     *
     * @param Container $genesis
     */
    public function register(Container $genesis)
    {
        $loader = $genesis['loader'];
        $loader->addClassMap(
            [
                'Genesis\\WordPress\\Assignments\\AssignmentsWoocommerce' => __DIR__ . '/Assignments.php'
            ]
        );
    }

    /**
     * Subscribe to Genesis events.
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

        \add_filter('genesis_assignments_page_context_array', ['Genesis\\WordPress\\Assignments\\AssignmentsWoocommerce', 'addPageContextItem']);
        \add_filter('genesis_assignments_page_context_rules', ['Genesis\\WordPress\\Assignments\\AssignmentsWoocommerce', 'addPageContextConditionals'], 10, 2);
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
