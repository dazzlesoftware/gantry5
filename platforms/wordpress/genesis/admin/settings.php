<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.NonceVerification.Recommended
defined('ABSPATH') or die;

add_action('admin_init', 'genesis_register_admin_settings');
add_action('admin_menu', 'genesis_manage_settings');
add_action('network_admin_menu', 'genesis_manage_settings');
add_filter('plugin_action_links', 'genesis_modify_plugin_action_links', 10, 2);
add_filter('network_admin_plugin_action_links', 'genesis_modify_plugin_action_links', 10, 2);

function genesis_register_admin_settings(): void
{
    if (current_user_can('manage_options')) {
        register_setting('genesis_plugin_options', 'genesis_plugin', 'genesis_sanitize_plugin_settings');
    }
}

function genesis_sanitize_plugin_settings(mixed $input): array
{
    $input = is_array($input) ? $input : [];

    return [
        'production' => !empty($input['production']) ? '1' : '0',
        'use_media_folder' => !empty($input['use_media_folder']) ? '1' : '0',
        'assign_posts' => !empty($input['assign_posts']) ? '1' : '0',
        'assign_pages' => !empty($input['assign_pages']) ? '1' : '0',
        'offline' => !empty($input['offline']) ? '1' : '0',
        'offline_message' => isset($input['offline_message']) ? sanitize_text_field(wp_unslash($input['offline_message'])) : '',
        'cache_path' => isset($input['cache_path']) ? sanitize_text_field(wp_unslash($input['cache_path'])) : '',
        'debug' => !empty($input['debug']) ? '1' : '0',
        'compile_yaml' => !empty($input['compile_yaml']) ? '1' : '0',
        'compile_twig' => !empty($input['compile_twig']) ? '1' : '0',
    ];
}

function genesis_manage_settings(): void
{
    if (current_user_can('manage_options')) {
        add_options_page('Genesis Settings', 'Genesis Settings', 'manage_options', 'genesis-settings', 'genesis_plugin_settings');
    }
}

function genesis_modify_plugin_action_links(array $links, string $file): array
{
    // Return normal links if not Genesis or insufficient permissions
    if (plugin_basename(GENESIS_PATH . '/genesis.php') !== $file || !current_user_can('manage_options')) {
        return $links;
    }

    // Add a few links to the existing links array
    return array_merge( $links, array(
        'settings' => '<a href="' . get_admin_url(get_current_blog_id(), 'options-general.php?page=genesis-settings') .'">' . esc_html__('Settings', 'genesis') . '</a>'
    ));

}

function genesis_plugin_settings(): void
{
    $option = wp_parse_args(
        get_option('genesis_plugin'),
        [
            'production' => '0',
            'use_media_folder' => '0',
            'assign_posts' => '1',
            'assign_pages' => '1',
            'offline' => '0',
            'offline_message' => '',
            'cache_path' => '',
            'debug' => '0',
            'compile_yaml' => '1',
            'compile_twig' => '1',
        ]
    );
    $settings_updated = isset($_GET['settings-updated']) ? sanitize_text_field(wp_unslash($_GET['settings-updated'])) : '';

    if ($settings_updated === 'true') {
        echo '<div id="message" class="updated fade"><p>' . esc_html__('Genesis plugin settings saved.', 'genesis') . '</p></div>';
    }

    ?>

    <div id="genesis-options-main">
        <div class="wrap">
            <form method="post" action="<?php echo esc_url(admin_url('options.php')); ?>">
                <?php settings_fields('genesis_plugin_options'); ?>

                <h1 class="available-options"><?php esc_html_e('Genesis Settings', 'genesis'); ?></h1>

                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="production1" title="<?php esc_attr_e('Production mode makes Genesis faster by more aggressive caching and ignoring changed files in the filesystem. Most changes made from administration should still be detected, but changes made in filesystem or database will be ignored.', 'genesis'); ?>"><?php esc_html_e('Production Mode', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="production1" type="radio" <?php checked($option['production'], '1'); ?> value="1" name="genesis_plugin[production]" />
                                <label for="production1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="production2" class="second" type="radio" <?php checked($option['production'], '0'); ?> value="0" name="genesis_plugin[production]" />
                                <label for="production2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="use_media_folder1" title="<?php esc_attr_e('By default Genesis media picker saves all files into the theme. If you want to save files into uploads folder instead, please select this option. Files in the old location can still be used, but are overridden by the files in the selected folder.', 'genesis'); ?>"><?php esc_html_e('Use Uploads Folder', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="use_media_folder1" type="radio" <?php checked($option['use_media_folder'], '1'); ?> value="1" name="genesis_plugin[use_media_folder]" />
                                <label for="use_media_folder1"><?php esc_html_e('Yes', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="use_media_folder2" class="second" type="radio" <?php checked($option['use_media_folder'], '0'); ?> value="0" name="genesis_plugin[use_media_folder]" />
                                <label for="use_media_folder2"><?php esc_html_e('No', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="assign_posts" title="<?php esc_attr_e('If your site has or will have a lot of blog posts, you should disable this feature and always assign posts to outlines by taxonomy or by some other criteria. Note that all existing post assignments will be removed.', 'genesis'); ?>"><?php esc_html_e('Post Assignments', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="assign_posts1" type="radio" <?php checked($option['assign_posts'], '1'); ?> value="1" name="genesis_plugin[assign_posts]" />
                                <label for="assign_posts1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="assign_posts2" class="second" type="radio" <?php checked($option['assign_posts'], '0'); ?> value="0" name="genesis_plugin[assign_posts]" />
                                <label for="assign_posts2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="assign_pages" title="<?php esc_attr_e('If your site has or will have a lot of pages (including custom types), you should disable this feature and always assign pages to outlines by taxonomy or by some other criteria. Note that all existing page assignments will be removed.', 'genesis'); ?>"><?php esc_html_e('Page Assignments', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="assign_pages1" type="radio" <?php checked($option['assign_pages'], '1'); ?> value="1" name="genesis_plugin[assign_pages]" />
                                <label for="assign_pages1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="assign_pages2" class="second" type="radio" <?php checked($option['assign_pages'], '0'); ?> value="0" name="genesis_plugin[assign_pages]" />
                                <label for="assign_pages2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="offline1"><?php esc_html_e('Offline Mode', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="offline1" type="radio" <?php checked($option['offline'], '1'); ?> value="1" name="genesis_plugin[offline]" />
                                <label for="offline1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="offline2" class="second" type="radio" <?php checked($option['offline'], '0'); ?> value="0" name="genesis_plugin[offline]" />
                                <label for="offline2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="offline_message"><?php esc_html_e('Offline Message', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="offline_message" type="text" value="<?php echo esc_attr($option['offline_message']); ?>" class="regular-text" name="genesis_plugin[offline_message]" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="cache_path"><?php esc_html_e('Cache Path', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="cache_path" type="text" value="<?php echo esc_attr($option['cache_path']); ?>" placeholder="<?php echo esc_attr(WP_CONTENT_DIR); ?>/cache/genesis" class="regular-text" name="genesis_plugin[cache_path]" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="debug1"><?php esc_html_e('Debug Mode', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="debug1" type="radio" <?php checked($option['debug'], '1'); ?> value="1" name="genesis_plugin[debug]" />
                                <label for="debug1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="debug2" class="second" type="radio" <?php checked($option['debug'], '0'); ?> value="0" name="genesis_plugin[debug]" />
                                <label for="debug2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="compile_yaml1" title="<?php esc_attr_e('Compile YAML configuration files into PHP, making page loads significantly faster.', 'genesis'); ?>"><?php esc_html_e('Compile YAML', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="compile_yaml1" type="radio" <?php checked($option['compile_yaml'], '1'); ?> value="1" name="genesis_plugin[compile_yaml]" />
                                <label for="compile_yaml1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="compile_yaml2" class="second" type="radio" <?php checked($option['compile_yaml'], '0'); ?> value="0" name="genesis_plugin[compile_yaml]" />
                                <label for="compile_yaml2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="compile_twig1" title="<?php esc_attr_e('Compile Twig template files into PHP, making page loads significantly faster.', 'genesis'); ?>"><?php esc_html_e('Compile Twig', 'genesis'); ?></label>
                            </th>
                            <td>
                                <input id="compile_twig1" type="radio" <?php checked($option['compile_twig'], '1'); ?> value="1" name="genesis_plugin[compile_twig]" />
                                <label for="compile_twig1"><?php esc_html_e('Enabled', 'genesis'); ?></label>&nbsp;&nbsp;
                                <input id="compile_twig2" class="second" type="radio" <?php checked($option['compile_twig'], '0'); ?> value="0" name="genesis_plugin[compile_twig]" />
                                <label for="compile_twig2"><?php esc_html_e('Disabled', 'genesis'); ?></label>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p class="submit">
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php esc_attr_e('Save Changes', 'genesis'); ?>" />
                </p>
            </form>
        </div>
    </div>
<?php
}
