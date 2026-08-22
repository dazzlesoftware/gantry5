<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Config\Config;
use Genesis\Component\Filesystem\Folder;
use Genesis\Component\System\Messages;
use Genesis\Framework\Base\Platform as BasePlatform;
use Genesis\WordPress\PostQuery;
use Genesis\WordPress\Utilities;
use Genesis\WordPress\Widgets;
use DazzleSoftware\Toolbox\DI\Container;

/**
 * The Platform Configuration class contains configuration information.
 *
 * @author Dazzle Software https://dazzlesoftware.org
 * @license MIT
 */
class Platform extends BasePlatform
{
    /** @var string */
    public string $content_dir;
    /** @var string */
    public string $includes_dir;
    /** @var string */
    public string $upload_dir;
    /** @var string */
    public string $genesis_dir;
    /** @var string */
    public string $multisite;

    /** @var string */
    protected string $name = 'wordpress';
    /** @var array */
    protected array $features = ['widgets' => true, 'fontawesome' => false];
    /** @var string */
    protected string $file = 'genesis/genesis.php';

    /**
     * Platform constructor.
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        $this->content_dir = Folder::getRelativePath(WP_CONTENT_DIR);
        $this->includes_dir = Folder::getRelativePath(ABSPATH . WPINC);
        $this->upload_dir = Folder::getRelativePath(\wp_upload_dir()['basedir']);
        $this->genesis_dir = Folder::getRelativePath(GENESIS_PATH);
        $this->multisite = \get_current_blog_id() !== 1 ? '/blog-' . \get_current_blog_id() : '';

        parent::__construct($container);

        /**
         * Please remember to add the newly added streams to the add_genesis_streams_to_kses()
         * in genesis.php so they would get added to the allowed kses protocols.
         */

        // Add wp-includes directory to the streams
        $this->items['streams']['wp-includes'] = ['type' => 'ReadOnlyStream', 'prefixes' => ['' => $this->includes_dir]];

        // Add wp-content directory to the streams
        $this->items['streams']['wp-content'] = ['type' => 'ReadOnlyStream', 'prefixes' => ['' => $this->content_dir]];
    }

    /**
     * @return string
     */
    public function getVersion(): string
    {
        return \get_bloginfo('version');
    }

    /**
     * @return Platform
     */
    public function init(): static
    {
        // Support linked sample data.
        $theme = isset($this->container['theme.name']) ? $this->container['theme.name'] : null;
        if ($theme && is_dir(WP_CONTENT_DIR . "/genesis/{$theme}/media-shared")) {
            $custom = WP_CONTENT_DIR . "/genesis/{$theme}/custom";
            if (!is_dir("{$custom}/config")) {
                try {
                    Folder::create("{$custom}/config");
                } catch (\Exception $e) {
                    throw new \RuntimeException(sprintf("Failed to create folder '%s'.", $custom), 500, $e);
                }

                // First run -- copy configuration into a single location.
                $shared = WP_CONTENT_DIR . "/genesis/{$theme}/theme-shared";
                $demo = WP_CONTENT_DIR . "/genesis/{$theme}/theme-demo";

                if (is_dir("{$shared}/custom/config")) {
                    Folder::copy("{$shared}/custom/config", "{$custom}/config");
                }
                if (is_dir("{$demo}/custom/config")) {
                    Folder::copy("{$demo}/custom/config", "{$custom}/config");
                }
            }
            array_unshift($this->items['streams']['genesis-theme']['prefixes'][''], "wp-content://genesis/{$theme}/theme-shared");
            array_unshift($this->items['streams']['genesis-theme']['prefixes'][''], "wp-content://genesis/{$theme}/theme-demo");
            array_unshift($this->items['streams']['genesis-theme']['prefixes'][''], "wp-content://genesis/{$theme}/custom");
        }

        if ($this->multisite) {
            $theme = $this->get('streams.genesis-theme.prefixes..0');
            if ($theme) {
                $this->set('streams.genesis-theme.prefixes..0', $theme . $this->multisite);
            }
        }

        return parent::init();
    }

    /**
     * @return string
     */
    public function getCachePath(): string
    {
        /** @var Config $global */
        $global = $this->container['global'];

        return $global->get('cache_path') ?: WP_CONTENT_DIR . '/cache/genesis' . $this->multisite;
    }

    /**
     * @return array
     */
    public function getThemesPaths(): array
    {
        return ['' => Folder::getRelativePath(\get_theme_root())];
    }

    /**
     * @return array
     */
    public function getMediaPaths(): array
    {
        $paths = [$this->upload_dir];

        // Support linked sample data.
        $theme = isset($this->container['theme.name']) ? $this->container['theme.name'] : null;
        if ($theme && is_dir(WP_CONTENT_DIR . "/genesis/{$theme}/media-shared")) {
            array_unshift($paths, "wp-content://genesis/{$theme}/media-shared");
            array_unshift($paths, "wp-content://genesis/{$theme}/media-demo");
        }

        /** @var Config $global */
        $global = $this->container['global'];
        if ($global->get('use_media_folder', false)) {
            $paths[] = 'genesis-theme://images';
        } else {
            array_unshift($paths, 'genesis-theme://images');
        }

        return ['' => $paths];
    }

    /**
     * @return array
     */
    public function getEnginesPaths(): array
    {
        if (is_link(GENESIS_PATH . '/engines')) {
            // Development environment.
            return ['' => [$this->genesis_dir . "/engines/{$this->name}", $this->genesis_dir . '/engines/common']];
        }

        return ['' => [$this->genesis_dir . '/engines']];
    }

    /**
     * @return array
     */
    public function getAssetsPaths(): array
    {
        if (is_link(GENESIS_PATH . '/assets')) {
            // Development environment.
            return ['' => ['genesis-theme://', $this->genesis_dir . "/assets/{$this->name}", $this->genesis_dir . '/assets/common']];
        }

        return ['' => ['genesis-theme://', $this->genesis_dir . '/assets']];
    }

    /**
     * Get preview url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    public function getThemePreviewUrl(string $theme): ?string
    {
        return admin_url('customize.php?theme=' . $theme);
    }

    /**
     * Get administrator url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    public function getThemeAdminUrl(string $theme): ?string
    {
        $genesis = Genesis::instance();

        if ($theme === $genesis['theme.name']) {
            return admin_url('admin.php?page=layout-manager');
        }

        return null;
    }

    /**
     * @param string $text
     * @return string
     */
    public function filter(string $text): string
    {
        return \do_shortcode($text);
    }

    /**
     * @param mixed $query
     * @return QueryIterator
     */
    public function query_posts(mixed $query): PostQuery
    {
        return new PostQuery($query);
    }

    /**
     * @return array
     */
    public function errorHandlerPaths(): array
    {
        // Catch errors in Genesis cache, plugin and theme only.
        $paths = ['#[\\\/]wp-content[\\\/](cache|plugins)[\\\/]genesis[\\\/]#', '#[\\\/]wp-content[\\\/]themes[\\\/]#'];

        // But if we have symlinked git repository, we need to catch errors from there, too.
        if (is_link(GENESIS_PATH)) {
           $paths = array_merge($paths, ['#[\\\/](assets|engines|platforms)[\\\/](common|wordpress)[\\\/]#', '#[\\\/]src[\\\/](classes|vendor)[\\\/]#', '#[\\\/]themes[\\\/]#']);
        }

        return $paths;
    }

    /**
     * @return string
     */
    public function settings(): ?string
    {
        return \admin_url('options-general.php?page=genesis-settings');
    }

    /**
     * @return string
     */
    public function update(): string
    {
        return \esc_url(\wp_nonce_url(\self_admin_url('update.php?action=upgrade-plugin&plugin=') . $this->file, 'upgrade-plugin_' . $this->file));
    }

    /**
     * @return array
     */
    public function updates(): array
    {
        $plugin = \get_site_transient('update_plugins');
        $list = [];
        if (!isset($plugin->response[$this->file]) || version_compare(GENESIS_VERSION, 0) < 0 || !\current_user_can('update_plugins')) { return $list; }

        $response = $plugin->response[$this->file];

        $list[] = 'Genesis ' . $response->new_version;

        return $list;
    }

    /**
     * getCategories logic for the categories selectize field
     *
     * @param array $args
     * @return mixed
     */
    public function getCategories(array $args = []): array
    {
        $default = [
            'type'                     => 'post',
            'orderby'                  => 'name',
            'order'                    => 'ASC',
            'hide_empty'               => 0,
            'hierarchical'             => 1,
            'taxonomy'                 => 'category',
            'pad_counts'               => 1
        ];

        $args = \wp_parse_args(\apply_filters('genesis_form_field_selectize_categories_args', $args), $default);

        $categories = \get_categories($args);
        $new_categories = [];

        foreach( $categories as $cat ) {
            $new_categories[$cat->cat_ID] = $cat->name;
        }

        return \apply_filters('genesis_form_field_selectize_categories', $new_categories);
    }

    /**
     * @param string $key
     * @param array $params
     * @return string|null
     */
    public function displayWidgets(string $key, array $params = []): ?string
    {
        return Widgets::displayPosition($key, $params);
    }

    /**
     * @param array $instance
     * @param array $params
     * @return string|null
     */
    public function displayWidget(array|string $instance = [], array $params = []): ?string
    {
        return Widgets::displayWidget($instance, $params);
    }

    /**
     * @return array
     */
    public function listWidgets(): array
    {
        return Widgets::listWidgets();
    }

    /**
     * @param array $params
     * @return string
     */
    public function displaySystemMessages(array $params = []): string
    {
        /** @var Theme $theme */
        $theme = $this->container['theme'];

        /** @var Messages $messages */
        $messages = $this->container['messages'];

        $context = [
            'messages' => $messages->get(),
            'params' => $params
        ];
        $messages->clean();

        return $theme->render('partials/messages.html.twig', $context);
    }

    /**
     * @param string $text
     * @param int $length
     * @param bool $html
     * @return string
     */
    public function truncate(string $text, int $length, bool $html = false): string
    {
        if (!$html) {
            $text = \wp_strip_all_tags($text);
        }

        if (!$length) {
            return $text;
        }

        return Utilities::truncate($text, $length, '...', true, $html);
    }

    /**
     * @param string $action
     * @param int|string|null $id
     * @return bool
     */
    public function authorize(string $action, string|int|null $id = null): bool
    {
        if ($action === 'filemanager.manage') {
            // File manager can read/write/delete arbitrary files under GENESIS_ROOT, so require
            // the site-administrator capability rather than falling through to the base class's
            // unconditional true.
            return (bool) \current_user_can('manage_options');
        }

        return parent::authorize($action, $id);
    }
}
