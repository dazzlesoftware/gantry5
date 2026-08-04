<?php
// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.Security.NonceVerification.Recommended
defined('ABSPATH') or die;

use Genesis\Admin\Router;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Framework\Platform;
use Genesis\Framework\Theme;
use Genesis\WordPress\NavMenuEditWalker;
use Genesis\Loader;

add_action('admin_init', 'genesis_admin_start_buffer', -10000);
add_action('admin_enqueue_scripts', 'genesis_admin_scripts');
add_action('wp_ajax_genesis', 'genesis_layout_manager');
add_filter('upgrader_package_options', 'genesis_upgrader_package_options', 10000);
add_filter('upgrader_source_selection', 'genesis_upgrader_source_selection', 0, 4);
add_action('upgrader_post_install', 'genesis_upgrader_post_install', 10, 3);

// Custom menu type:
add_action('admin_head', 'genesis_add_menu_item_types', 99);
add_filter('wp_setup_nav_menu_item', 'genesis_customize_menu_item_label');
add_filter('wp_edit_nav_menu_walker', 'genesis_wp_edit_nav_menu_walker');
add_filter('pre_wp_unique_post_slug', 'genesis_wp_unique_post_slug', 0, 6);

// Check if Timber is active before displaying sidebar button
if (class_exists( 'Timber')) {
    // Load Genesis icon styling for the admin sidebar
    add_action(
        'admin_enqueue_scripts',
        static function() {
            if(is_admin()) {
                $version = defined('GENESIS_VERSION') ? GENESIS_VERSION : null;
                wp_enqueue_style('wordpress-admin-icon', Document::url('genesis-assets://css/wordpress-admin-icon.css'), [], $version);
            }
        }
    );

    // Adjust menu to contain Genesis stuff.
    add_action(
        'admin_menu',
        static function() {
            $genesis = Genesis::instance();

            /** @var Theme $theme */
            $theme = $genesis['theme'];
            $name = $theme->details()['details.name'];
            remove_submenu_page('themes.php', 'theme-editor.php');
            add_menu_page("{$name} Theme", "{$name} Theme", 'manage_options', 'layout-manager', 'genesis_layout_manager');
        },
        100
    );
}

function genesis_admin_start_buffer()
{
    ob_start();
    ob_implicit_flush(false);
}

function genesis_init()
{
    $genesis = Genesis::instance();
    if (!isset($genesis['router'])) {
        $genesis['router'] = $router = new Router($genesis);
        $router->boot()->load();
    }

    return $genesis;
}

function genesis_add_menu_item_type_particle()
{
    global $_nav_menu_placeholder, $nav_menu_selected_id;

    $_nav_menu_placeholder = 0 > $_nav_menu_placeholder ? $_nav_menu_placeholder - 1 : -1;

    $genesis = genesis_init();

    // Get full list of particles.
    $particles = $genesis['particles']->all();
    ?>
    <div class="posttypediv" id="custom-item-types">
        <div id="tabs-panel-custom-item-types" class="tabs-panel tabs-panel-active">
            <ul id="custom-item-types-checklist" class="categorychecklist form-no-clear">
                <?php foreach ($particles as $name => $particle): ?>
                <?php if ($name !== 'widget' && $particle['type'] !== 'particle') continue; ?>
                <li>
                    <label class="menu-item-title">
                        <input type="radio" class="menu-item-checkbox" name="menu-item[<?php echo esc_attr((string) $_nav_menu_placeholder); ?>][menu-item-object-id]" value="-1">
                        <?php echo esc_html($particle['name']); ?>
                    </label>
                    <input type="hidden" class="menu-item-type" name="menu-item[<?php echo esc_attr((string) $_nav_menu_placeholder); ?>][menu-item-type]" value="custom">
                    <input type="hidden" class="menu-item-title" name="menu-item[<?php echo esc_attr((string) $_nav_menu_placeholder); ?>][menu-item-title]" value="<?php echo esc_attr($particle['name']); ?>">
                    <input type="hidden" class="menu-item-attr-title" name="menu-item[<?php echo esc_attr((string) $_nav_menu_placeholder); ?>][menu-item-attr-title]" value="genesis-particle-<?php echo esc_attr($name); ?>"/>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <input type="hidden" value="custom" name="menu-item[<?php echo esc_attr((string) $_nav_menu_placeholder); ?>][menu-item-type]" />

        <p class="button-controls wp-clearfix">
            <span class="add-to-menu">
                <input type="submit"<?php wp_nav_menu_disabled_check( $nav_menu_selected_id ); ?> class="button-secondary submit-add-to-menu right" value="<?php esc_attr_e( 'Add to Menu', 'genesis' ); ?>" name="add-custom-menu-item" id="submit-custom-item-types" />
                <span class="spinner"></span>
            </span>
        </p>

    </div>
    <?php
}

function genesis_customize_menu_item_label($menu_item)
{
    if ('custom' !== $menu_item->type || strpos($menu_item->attr_title, 'genesis-particle-') !== 0) {
        return $menu_item;
    }

    $genesis = genesis_init();

    // Get full list of particles.
    $particles = $genesis['particles']->all();

    $id = substr($menu_item->attr_title, strlen('genesis-particle-'));

    if (isset($particles[$id])) {
        $menu_item->type_label = $particles[$id]['name'] . ' ' . __('Particle', 'genesis');
    } else {
        $menu_item->type_label = __('Unknown Particle', 'genesis');
    }

    return $menu_item;
}

function genesis_wp_edit_nav_menu_walker()
{
    genesis_init();

    return NavMenuEditWalker::class;
}

function genesis_wp_unique_post_slug($override_slug, $slug, $post_ID, $post_status, $post_type, $post_parent)
{
    global $wpdb;
    if ($post_type !== 'nav_menu_item') {
        return null;
    }
    if (strpos($slug, '__particle-') === 0) {
        return $slug;
    }

    $post = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND ID = %d LIMIT 1",
            $post_type,
            $post_ID
        )
    );
    if (!isset($post->content) || strpos($post->post_excerpt, 'genesis-particle-') !== 0) {
        return null;
    }

    if (strpos($post->content, '__particle-') === 0) {
        return $post->content;
    }

    return "__particle-{$post_ID}";
}


function genesis_add_menu_item_types()
{
    add_meta_box('genesis_particles', __('Particles', 'genesis'), 'genesis_add_menu_item_type_particle', 'nav-menus', 'side', 'low');
}

function genesis_admin_scripts()
{
    $page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';
    if ($page === 'layout-manager') {
        genesis_layout_manager();
    }
}

function genesis_layout_manager()
{
    static $output = null;

    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'genesis'));
    }

    add_filter('admin_body_class', static function() {
        return 'genesis genesis-wordpress';
    });

    if ($output) {
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Router output is trusted admin HTML.
        echo $output;
        return;
    }

    // Detect Genesis Framework or fail gracefully.
    if (!class_exists(Loader::class)) {
        wp_die(esc_html__('Genesis Framework not found.', 'genesis'));
    }

    // Initialize administrator or fail gracefully.
    try {
        Loader::setup();

        $genesis = Genesis::instance();
        $router = new Router($genesis);
        $genesis['router'] = $router;

        // Dispatch to the controller.
        $output = $router->dispatch();
    } catch (Exception $e) {
        throw $e;
    }
}

/**
 * SimpleXmlElement is a weird class that acts like a boolean, we are going to take advantage from that.
 */
class GenesisTruthy extends SimpleXMLElement {}

function genesis_upgrader_package_options($options)
{
    if (isset($options['hook_extra']['type']) && !$options['clear_destination']) {
        if ($options['hook_extra']['type'] === 'theme' && $options['abort_if_destination_exists']) {
            // Prepare for manual theme upgrade.
            $options['abort_if_destination_exists'] = new GenesisTruthy('<bool><true></true></bool>');
            $options['hook_extra']['genesis_abort'] = $options['abort_if_destination_exists'];
        } elseif ($options['hook_extra']['type'] === 'plugin' && strpos(basename($options['package']), 'genesis') !== false) {
            // Allow Genesis plugin to be manually upgraded / downgraded.
            $options['clear_destination'] = true;
        }
    }

    return $options;
}

function genesis_upgrader_source_selection($source, $remote_source, $upgrader, $options = [])
{
    // Allow upgrading Genesis themes from uploader.
    if (isset($options['genesis_abort']) && file_exists("{$source}/genesis/theme.yaml")) {
        $upgrader->skin->feedback('Genesis-compatible theme detected.');
        unset($options['genesis_abort']->true);
    }

    return $source;
}

function genesis_upgrader_post_install($success, $options, $result)
{
    if ($success) {
        $theme = isset($options['genesis_abort']) && !$options['genesis_abort'];
        $plugin = (isset($options['plugin']) && $options['plugin'] === 'genesis/genesis.php')
            || (isset($options['type']) && $options['type'] === 'plugin' && basename($result['destination']) === 'genesis');

        // Clear Genesis cache after plugin / Genesis theme installs.
        if ($theme || $plugin) {
            global $wp_filesystem;

            $genesis = Genesis::instance();

            /** @var Platform $platform */
            $platform = $genesis['platform'];

            $path = $platform->getCachePath();
            if ($wp_filesystem->is_dir($path)) {
                $wp_filesystem->rmdir($path, true);
            }

            // Make sure that PHP has the latest data of the files.
            clearstatcache();

            // Remove all compiled files from opcode cache.
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        }
    }
}
