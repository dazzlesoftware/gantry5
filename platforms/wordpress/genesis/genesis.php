<?php
// phpcs:disable PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound
/**
 * Plugin Name: Genesis Framework
 * Plugin URI: https://dazzlesoftware.org/
 * Description: Genesis theme framework.
 * Version: @version@
 * Requires at least: 6.8
 * Requires PHP: 8.3
 * Author: Dazzle Software
 * Author URI: https://dazzlesoftware.org/
 * License: GNU General Public License v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: genesis
 * Domain Path: /admin/languages
 */

defined('ABSPATH') or die;

// Fail safe version check for PHP < 8.3.0
if (PHP_VERSION_ID < 80300) {
    if (is_admin()) {
        add_action('admin_notices', 'genesis_php_version_error');
    }
    return;
}

require_once dirname(__FILE__) . '/src/Loader.php';

if (!defined('GENESIS_PATH')) {
    define('GENESIS_PATH', rtrim(WP_PLUGIN_DIR, '/\\') . '/genesis');
}

if (!is_admin()) {
    return;
}

// Load plugin settings.
require_once dirname(__FILE__) . '/admin/settings.php';

if (!defined('GENESIS_ADMIN_PATH')) {
    define('GENESIS_ADMIN_PATH', GENESIS_PATH . '/admin');
}
if (!defined('GENESISADMIN_PATH')) {
    define('GENESISADMIN_PATH', GENESIS_ADMIN_PATH);
}

genesis_register_private_theme_updaters();

// Force a one-time refresh when Genesis's theme updater behavior changes.
add_action('load-themes.php', 'genesis_maybe_reset_theme_update_cache', 5);

// Let WordPress core handle Genesis theme updates (WordPress.org only).
add_action('load-themes.php', 'genesis_refresh_wporg_theme_updates');

// Add Genesis defaults on plugin activation.
register_activation_hook(__FILE__, 'genesis_plugin_defaults');
add_action('admin_init', 'genesis_plugin_defaults');

function genesis_register_private_theme_updaters()
{
    $private_updaters = array(
        'genesis_helium'   => get_theme_root() . '/genesis_helium/private/theme-updates.php',
        'genesis_hydrogen' => get_theme_root() . '/genesis_hydrogen/private/theme-updates.php',
    );

    foreach ($private_updaters as $updater) {
        if (file_exists($updater)) {
            require_once $updater;
        }
    }
}

function genesis_maybe_reset_theme_update_cache()
{
    if (!genesis_has_installed_theme_updates()) {
        return;
    }

    $refresh_signature = 'private-theme-updaters-v1';
    $option_name = 'genesis_theme_updates_refresh_signature';

    if (get_option($option_name) === $refresh_signature) {
        return;
    }

    delete_site_transient('update_themes');
    delete_site_transient('update_themes_last_checked');
    update_option($option_name, $refresh_signature);
}

function genesis_has_installed_theme_updates()
{
    $genesis_themes = array('genesis_helium', 'genesis_hydrogen');
    $installed_themes = wp_get_themes();

    foreach ($genesis_themes as $slug) {
        if (isset($installed_themes[$slug])) {
            return true;
        }
    }

    return false;
}

function genesis_refresh_wporg_theme_updates()
{
    if (!genesis_has_installed_theme_updates()) {
        return;
    }

    $last_checked = (int) get_site_transient('update_themes_last_checked');
    if ($last_checked > 0 && (time() - $last_checked) < HOUR_IN_SECONDS) {
        return;
    }

    if (!function_exists('wp_update_themes')) {
        require_once ABSPATH . 'wp-admin/includes/update.php';
    }

    wp_update_themes();
    set_site_transient('update_themes_last_checked', time(), HOUR_IN_SECONDS);
}

function genesis_plugin_defaults()
{
    $defaults = array(
        'production'       => '0',
        'use_media_folder' => '0',
        'assign_posts'     => '1',
        'assign_pages'     => '1',
        'debug'            => '0',
        'offline'          => '0',
        'offline_message'  => 'Site is currently in offline mode. Please try again later.',
        'cache_path'       => '',
        'compile_yaml'     => '1',
        'compile_twig'     => '1'
    );

    $option = (array)get_option('genesis_plugin');

    update_option('genesis_plugin', $option + $defaults);
}

add_filter('kses_allowed_protocols', 'genesis_add_streams_to_kses');

function genesis_add_streams_to_kses($protocols)
{
    $streams = array(
        'genesis-cache',
        'genesis-themes',
        'genesis-theme',
        'genesis-assets',
        'genesis-media',
        'genesis-engines',
        'genesis-engine',
        'genesis-layouts',
        'genesis-particles',
        'genesis-blueprints',
        'genesis-config',
        'wp-includes',
        'wp-content',
    );

    $protocols = array_merge($protocols, $streams);
    return $protocols;
}

// Initialize plugin language on init to avoid WP 6.7+ early translation notices.
add_action('init', 'genesis_load_textdomain', 1);

function genesis_load_textdomain()
{
    $domain = 'genesis';
    $languages_path = basename(GENESIS_PATH) . '/admin/languages';

    if (load_plugin_textdomain($domain, false, $languages_path) === false) {
        add_filter('plugin_locale', 'genesis_modify_locale', 10, 2);
        load_plugin_textdomain($domain, false, $languages_path);
        remove_filter('plugin_locale', 'genesis_modify_locale', 10);
    }
}

function genesis_modify_locale($locale, $domain = null)
{
    // Revert the genesis domain locale to en_US
    if ($domain === 'genesis' || $domain === 'nucleus') {
        $locale = 'en_US';
    }

    return $locale;
}

function genesis_php_version_error()
{
    printf(
        '<div class="error"><p>%s</p></div>',
        sprintf(
            /* translators: 1: current PHP version, 2: required PHP version. */
            esc_html__('You are running PHP %1$s, but Genesis Framework needs at least PHP %2$s to run.', 'genesis'),
            esc_html(PHP_VERSION),
            '8.3.0'
        )
    );
}
// Preserve Genesis theme settings on update.
add_action('upgrader_pre_install', 'genesis_backup_theme_settings', 10, 2);
add_action('upgrader_post_install', 'genesis_restore_theme_settings', 10, 2);

function genesis_backup_theme_settings($return, $hook_extra)
{
    if (!genesis_is_managed_theme_update($hook_extra)) {
        return $return;
    }

    $theme = $hook_extra['theme'];
    $theme_dir = get_theme_root() . '/' . $theme;
    $backup_dir = WP_CONTENT_DIR . '/genesis-theme-backups/' . $theme;
    $filesystem = genesis_get_filesystem();

    if (!$filesystem) {
        return $return;
    }

    if ($filesystem->is_dir($backup_dir)) {
        $filesystem->delete($backup_dir, true);
    }

    wp_mkdir_p($backup_dir);
    genesis_copy_theme_settings_directory($theme_dir . '/custom', $backup_dir . '/custom', $filesystem);
    genesis_copy_theme_settings_directory($theme_dir . '/config', $backup_dir . '/config', $filesystem);

    return $return;
}

function genesis_restore_theme_settings($return, $hook_extra)
{
    if (!genesis_is_managed_theme_update($hook_extra)) {
        return $return;
    }

    $theme = $hook_extra['theme'];
    $theme_dir = get_theme_root() . '/' . $theme;
    $backup_dir = WP_CONTENT_DIR . '/genesis-theme-backups/' . $theme;
    $filesystem = genesis_get_filesystem();

    if (!$filesystem) {
        return $return;
    }

    genesis_copy_theme_settings_directory($backup_dir . '/custom', $theme_dir . '/custom', $filesystem);
    genesis_copy_theme_settings_directory($backup_dir . '/config', $theme_dir . '/config', $filesystem);

    return $return;
}

function genesis_is_managed_theme_update($hook_extra)
{
    if (empty($hook_extra['theme'])) {
        return false;
    }

    return in_array($hook_extra['theme'], array('genesis_helium', 'genesis_hydrogen'), true);
}

function genesis_get_filesystem()
{
    global $wp_filesystem;

    if (!function_exists('WP_Filesystem')) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }

    if (!WP_Filesystem()) {
        return false;
    }

    return $wp_filesystem;
}

function genesis_copy_theme_settings_directory($source, $destination, $filesystem)
{
    if (!$filesystem->is_dir($source)) {
        return;
    }

    copy_dir($source, $destination);
}
