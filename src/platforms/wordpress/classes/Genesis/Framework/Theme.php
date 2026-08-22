<?php

declare(strict_types=1);
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound,WordPress.Security.NonceVerification.Recommended

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

defined('ABSPATH') || exit;

use Genesis\Component\Config\Config;
use Genesis\Component\Theme\AbstractTheme;
use Genesis\Component\Theme\ThemeTrait;
use Genesis\Debugger;
use Genesis\WordPress\Widget\Particle;
use Genesis\WordPress\Widgets;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Timber\Timber;
use Timber\Loader;
use Timber\PostQuery;
use Timber\User;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\Loader\LoaderInterface;
use WP_Query;

/**
 * Class Theme
 * @package Genesis\Framework
 */
class Theme extends AbstractTheme
{
    use ThemeTrait;

    /** @var string */
    public $url;

    /** @var User */
    protected $user;
    /**
     * @var bool
     * @deprecated 5.1.5
     */
    protected $wordpress = false;

    /**
     * @param array $context
     * @return array
     */
    public function getContext(array $context): array
    {
        $context = parent::getContext($context);

        $genesis = Genesis::instance();

        $context['site'] = $genesis['site'];
        $context['wordpress'] = $genesis['platform'];
        $context['textdomain'] = $this->details()->get('configuration.theme.textdomain');

        if (!$this->user) {
            $this->user = Timber::get_user();
        }

        $context['current_user'] = $this->user;

        if (\function_exists('is_rtl')) {
            $context['is_rtl'] = is_rtl();
        }

        return $context;
    }


    /**
     * @see AbstractTheme::extendTwig()
     *
     * @param Environment $twig
     * @param LoaderInterface $loader
     * @return Environment
     */
    public function extendTwig(Environment $twig, ?LoaderInterface $loader = null): Environment
    {
        parent::extendTwig($twig, $loader);

        // FIXME: Get timezone from WP.
        //$timezone = 'UTC';
        //$twig->getExtension(CoreExtension::class)->setTimezone(new \DateTimeZone($timezone));

        return $twig;
    }

    public function prepare_particles()
    {
        if(!\is_admin()) {
            $genesis = Genesis::instance();

            /** @var Theme $theme */
            $theme = $genesis['theme'];
            $theme->prepare();
        }
    }

    /**
     * Convert all stream uris into proper links.
     */
    public function postProcessOutput($html)
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        // Only filter our streams. If there's an error (bad UTF8), fallback with original output.
        return $document::urlFilter($html, false, 0, true) ?: $html;
    }

    /**
     * @see AbstractTheme::renderer()
     */
    public function renderer(): Environment
    {
        if (!$this->renderer) {
            $twig = parent::renderer();
            $twig = \apply_filters('timber/twig', $twig);
            $twig = \apply_filters('timber/loader/twig', $twig);
            $this->renderer = $twig;
        }

        return $this->renderer;
    }

    /**
     * @see AbstractTheme::render()
     *
     * @param string $file
     * @param array $context
     * @return string
     */
    public function render(string $file, array $context = []): string
    {
        static $timberContext;

        if (!isset($timberContext)) {
            $timberContext = Timber::context();
        }

        // Include Genesis specific things to the context.
        $context = array_replace($timberContext, $context);

        return $this->renderer()->render($file, $context);
    }

    public function set_template_layout()
    {
        $assignments = new Assignments();
        $selected = $assignments->select();

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage('Selecting outline (rules, matches, scores):', 'debug');
            Debugger::addMessage($assignments->getPage(), 'debug');
            Debugger::addMessage($assignments->matches(), 'debug');
            Debugger::addMessage($assignments->scores(), 'debug');
        }

        $this->setLayout($selected);
    }

    /**
     * Return posts for the current page, applying optional blog category filters
     * without replacing WordPress's global main query.
     */
    public function getPosts(): PostQuery
    {
        global $wp_query;

        $config = Genesis::instance()['config'];
        $include = trim((string) $config->get('content.blog.query.categories.include'));
        $exclude = trim((string) $config->get('content.blog.query.categories.exclude'));

        if (!\is_home() || ($include === '' && $exclude === '')) {
            return Timber::get_posts($wp_query);
        }

        $queryArgs = $wp_query->query_vars;

        if ($include !== '') {
            $queryArgs['cat'] = preg_replace('/\s+/', ',', $include);
        } else {
            $categories = preg_split('/\s+/', $exclude, -1, PREG_SPLIT_NO_EMPTY);
            $queryArgs['category__not_in'] = array_map('intval', $categories);
        }

        return Timber::get_posts(new WP_Query($queryArgs));
    }

    public function widgets_init()
    {
        $genesis = Genesis::instance();

        /** @var Outlines $outlines */
        $outlines = $genesis['outlines'];

        // Positions are set inside layouts and we need to grab all of them as we do not yet know which layout will be
        // displayed. We also need to register all the positions for the admin.
        $positions = $outlines->positions();

        if (!$positions) {
            // No positions are set; display notification in admin.
            \add_action('load-widgets.php',
                function() {
                    \add_action('admin_notices', function() {
                        $message = __('No widget blocks have been defined. Please add some in Genesis Layout Manger or read <a target="_blank" rel="noopener" href="https://codex.dazzlecms.org/particles/position">documentation</a> on how to create widget blocks.', 'genesis');
                        echo '<div class="error"><p>' . wp_kses_post($message) . '</p></div>';
                    });
                });
        } else {
            foreach ($positions as $name => $title) {
                // We are just registering positions with defaults; there is an event to override chrome based on the
                // template settings. See \Genesis\Wordpress\Widgets for more information.
                \register_sidebar([
                    // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Sidebar title is dynamic from configuration.
                    'name'          => $title,
                    'id'            => \sanitize_title($name),
                    'before_widget' => '<div id="%1$s" class="widget %2$s">',
                    'after_widget'  => '</div>',
                    'before_title'  => '<h2 class="widgettitle">',
                    'after_title'   => '</h2>',
                ]);
            }
        }
    }

    public function register_menus()
    {
        $genesis = Genesis::instance();

        /** @var Outlines $outlines */
        $outlines = $genesis['outlines'];

        $menuLocations = $outlines->menuLocations();

        if ($menuLocations) {
            \register_nav_menus($menuLocations);
        }
    }

    /**
     * @param string $text
     * @return string
     */
    public function url_filter($text)
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        // Only filter our streams.
        return $document::urlFilter($text, true, 0, true);
    }

    public function register_post_types()
    {
        //this is where you can register custom post types
    }

    public function register_taxonomies()
    {
        //this is where you can register custom taxonomies
    }

    public function disable_wpautop()
    {
        $genesis = Genesis::instance();

        /** @var Config $config */
        $config = $genesis['config'];

        $wpautop = $config->get('content.general.wpautop.enabled', '1');

        if ($wpautop == '0') {
            \remove_filter('the_content', 'wpautop');
            \remove_filter('comment_text', 'wpautop');
        }
    }

    public function enqueue_scripts()
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        $document::registerAssets();
    }

    public function print_styles()
    {
        $styles = Genesis::instance()->styles();
        if ($styles) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Contains pre-built style tags.
            echo implode("\n    ", $styles) . "\n";
        }
    }

    public function print_scripts()
    {
        $scripts = Genesis::instance()->scripts();
        if ($scripts) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Contains pre-built script tags.
            echo implode("\n    ", $scripts) . "\n";
        }
    }

    public function print_inline_scripts()
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];
        $document::registerScripts('footer');

        $scripts = Genesis::instance()->scripts('footer');
        if ($scripts) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Contains pre-built script tags.
            echo implode("\n    ", $scripts) . "\n";
        }
    }

    public function preset_styles_init()
    {
        if (!\is_admin()) {
            $genesis = Genesis::instance();

            $cookie = md5($this->name);
            $request = $genesis['request'];

            $presetVar = 'presets';
            $resetVar = 'reset-settings';

            if ($request->request[$resetVar] !== null) {
                $preset = false;
            } else {
                $preset = $request->request[$presetVar];
            }

            if ($preset !== null) {
                if ($preset === false) {
                    // Invalidate the cookie.
                    $this->updateCookie($cookie, false, time() - 42000);
                } else {
                    // Update the cookie.
                    $this->updateCookie($cookie, \sanitize_html_class($preset), 0);
                }
            } else {
                $preset = $request->cookie[$cookie];
            }

            $preset = ($preset) ? \sanitize_html_class($preset) : null;
            $this->setPreset($preset);
        }
    }

    public function preset_styles_update_css()
    {
        $cookie = md5($this->name);

        $this->updateCookie($cookie, false, time() - 42000);
    }

    /**
     * @param mixed $atts
     * @param mixed|null $content
     * @return mixed
     */
    public function loadposition_shortcode($atts, $content = null)
    {
        extract(\shortcode_atts(['id' => ''], $atts));

        $genesis = Genesis::instance();
        $platform = $genesis['platform'];

        return $platform->displayWidgets($id);
    }

    /**
     * @param Environment $twig
     * @return Environment
     */
    public function timber_loader_twig(Environment $twig)
    {
        $loader = $twig->getLoader();
        if ($loader instanceof FilesystemLoader) {
            $this->setTwigLoaderPaths($loader);
        }

        $twig->enableAutoReload();

        return $twig;
    }

    /**
     * Extend file type support in WP Theme Editor
     *
     * @param $default_types
     * @return array
     */
    public function extend_theme_editor_filetypes($default_types)
    {
        $filetypes = [
            'twig',
            'yaml',
            'scss'
        ];

        return $filetypes;
    }

    /**
     * Register menu locations.
     */
    public function register_nav_menus()
    {
        // TODO: Not implemented
        $locations = [];
        foreach ($locations as $key => $val) {
            \register_nav_menu($key, $val);
        }
    }

    public function install()
    {
        $installer = new ThemeInstaller($this->name);
        $installer->installDefaults();
        $installer->finalize();
    }

    /**
     * Get list of twig paths.
     *
     * @return array
     */
    public static function getTwigPaths()
    {
        /** @var UniformResourceLocator $locator */
        $locator = static::genesis()['locator'];

        return $locator->mergeResources(['genesis-theme://views', 'genesis-engine://views']);
    }

    /**
     * Set Timber template lookup locations.
     */
    public function timberLocations(array $locations): array
    {
        return [Loader::MAIN_NAMESPACE => static::getTwigPaths()];
    }

    /**
     * Configure Twig using Timber 2's environment-options filter.
     */
    public function timberEnvironmentOptions(array $options): array
    {
        $global = Genesis::instance()['global'];

        $options['cache'] = $global->get('compile_twig', 1) ? $this->getCachePath('twig') : false;
        $options['autoescape'] = false;

        return $options;
    }

    /**
     * Remove particles from the WP menus.
     *
     * @param \WP_Post[] $menuItems
     * @param array $args
     * @return mixed
     */
    public function filterMenuObjects($menuItems, $args)
    {
        foreach ($menuItems as $k => $item) {
            if (strpos($item->post_excerpt, 'genesis-particle-') === 0) {
                unset($menuItems[$k]);
            }
        }

        return $menuItems;
    }

    public function addMenuMeta($menu_item)
    {
        $meta = \get_post_meta($menu_item->ID, '_menu_item_genesis', true);

        $menu_item->Genesis = $meta ? json_decode($meta, true) : null;

        return $menu_item;
    }

    /**
     * @see AbstractTheme::init()
     */
    protected function init(): void
    {
        parent::init();

        $genesis = Genesis::instance();

        /** @var Config $global */
        $global = $genesis['global'];

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $installed = is_dir($locator->findResource('genesis-theme://config/default', true, true));
        $linked = is_link($locator->findResource('genesis-theme://'));
        if (!$installed && !$linked) {
            $this->install();
        }

        \add_theme_support('html5', ['comment-list', 'comment-form', 'search-form', 'gallery', 'caption', 'widgets']);
        \add_theme_support('title-tag');
        \add_theme_support('post-formats', []);
        \add_theme_support('post-thumbnails');
        \add_theme_support('menus');
        \add_theme_support('widgets');

        \add_filter('script_loader_tag', [Document::class, 'script_add_attributes'], 10, 2);
        \add_filter('timber/context', [$this, 'getContext']);
        \add_filter('timber/locations', [$this, 'timberLocations']);
        \add_filter('timber/twig/environment/options', [$this, 'timberEnvironmentOptions']);
        \add_filter('timber/loader/twig', [$this, 'timber_loader_twig']);
        \add_filter('timber/output', [$this, 'postProcessOutput']);
        \add_filter('wp_theme_editor_filetypes', [$this, 'extend_theme_editor_filetypes']);
        \add_filter('timber/twig', [$this, 'extendTwig'], 100);
        \add_filter('the_content', [$this, 'url_filter'], 0);
        \add_filter('the_excerpt', [$this, 'url_filter'], 0);
        \add_filter('widget_text', [$this, 'url_filter'], 0);
        \add_filter('widget_content', [$this, 'url_filter'], 0);
        \add_filter('widget_text', 'do_shortcode');
        \add_filter('widget_content', 'do_shortcode');
        \add_filter('widget_update_callback', [Widgets::class, 'widgetCustomClassesUpdate'], 10, 4);
        \add_filter('dynamic_sidebar_params', [Widgets::class, 'widgetCustomClassesSidebarParams'], 9);

        // Menu
        \add_filter('wp_nav_menu_objects', [$this, 'filterMenuObjects'], 0, 2);
        \add_filter('wp_setup_nav_menu_item', [$this, 'addMenuMeta']);

        \add_action('init', [$this, 'register_post_types']);
        \add_action('init', [$this, 'register_taxonomies']);
        \add_action('init', [$this, 'register_menus']);
//        add_action('after_setup_theme', [$this, 'register_nav_menus']);
        \add_action('template_redirect', [$this, 'set_template_layout'], -10000);
        \add_action('template_redirect', [$this, 'disable_wpautop'], 10000);
        \add_action('widgets_init', [$this, 'widgets_init']);
        \add_action('wp_enqueue_scripts', [$this, 'prepare_particles'], 15);
        \add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts'], 20);
        \add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts'], 20);
        \add_action('wp_head', [$this, 'print_styles'], 20);
        \add_action('wp_head', [$this, 'print_scripts'], 30);
        \add_action('admin_print_styles', [$this, 'print_styles'], 200);
        \add_action('admin_print_scripts', [$this, 'print_scripts'], 200);
        \add_action('wp_footer', [$this, 'print_inline_scripts'], 100);
        \add_action('in_widget_form', [Widgets::class, 'widgetCustomClassesForm'], 10, 3);
        \add_action('widgets_init', static function() {
            \register_widget(Particle::class);
        });

        // Particle AJAX actions.
        \add_action('wp_ajax_particle', [$this, 'ajax_particle']);
        \add_action('wp_ajax_nopriv_particle', [$this, 'ajax_particle']);

        \add_shortcode('loadposition', [$this, 'loadposition_shortcode']);

        // Offline support.
        \add_action('init', static function() use ($genesis, $global) {
            global $pagenow;
            if ($global->get('offline')) {
                if (!(\is_super_admin() || \current_user_can('manage_options') || $pagenow === 'wp-login.php')) {
                    if (\locate_template(['offline.php'])) {
                        \add_filter('template_include', static function () {
                            return \locate_template(['offline.php']);
                        });
                    } else {
                        \wp_die(wp_kses_post($global->get('offline_message')), esc_html(\get_bloginfo('title')));
                    }
                } else {
                    $genesis['messages']->add(\__('Site is currently in offline mode.', 'genesis'), 'warning');
                }
            }
        });

        $this->preset_styles_init();

        // Load text domains on init or later to avoid WP 6.7+ early translation notices.
        $this->loadTextDomains();

        $this->url = $genesis['site']->theme->link;

        $genesis['configuration'] = 'default';

        $genesis->fireEvent('theme.init');
    }

    /**
     * @see AbstractTheme::setTwigLoaderPaths()
     *
     * @param LoaderInterface $loader
     * @return FilesystemLoader
     */
    protected function setTwigLoaderPaths(LoaderInterface $loader): ?FilesystemLoader
    {
        $loader = parent::setTwigLoaderPaths($loader);

        if ($loader) {
            // TODO: right now we are replacing all paths; we need to do better, but there are some issues with this call.
            $loader->setPaths(static::getTwigPaths());
        }

        return $loader;
    }

    /**
     * @param string $name
     * @param string $value
     * @param int $expire
     */
    protected function updateCookie($name, $value, $expire = 0)
    {
        $path   = SITECOOKIEPATH;
        $domain = COOKIE_DOMAIN;

        setcookie($name, $value, $expire, $path, $domain);
    }

    protected function loadTextDomains()
    {
        $engineDomain = $this->details()->get('configuration.genesis.engine', 'nucleus');
        $lookup = '/engines/' . $engineDomain . '/languages';
        if (!file_exists(GENESIS_PATH . $lookup)) {
            $lookup = '/engines/wordpress/' . $engineDomain . '/languages';
        }
        $lookup = basename(GENESIS_PATH) . $lookup;

        $themeDomain = $this->details()->get('configuration.theme.textdomain', $this->name);
        $themePath = $this->path . '/languages';

        $loader = static function () use ($engineDomain, $lookup, $themeDomain, $themePath) {
            // phpcs:ignore PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound
            if (\load_plugin_textdomain($engineDomain, false, $lookup) === false) {
                \add_filter('plugin_locale', 'modify_genesis_locale', 10, 2);
                // phpcs:ignore PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound
                \load_plugin_textdomain($engineDomain, false, $lookup);
                \remove_filter('plugin_locale', 'modify_genesis_locale', 10);
            }

            \load_theme_textdomain($themeDomain, $themePath);
        };

        if (\did_action('init')) {
            $loader();
            return;
        }

        \add_action('init', $loader, 1);
    }

    /**
     * Serve particle AJAX requests in '/wp-admin/admin-ajax.php?action=particle'.
     */
    public function ajax_particle()
    {
        $format = !empty($_GET['format']) ? \sanitize_key(\wp_unslash($_GET['format'])) : 'html';
        $outline = !empty($_GET['outline']) ? \sanitize_key(\wp_unslash($_GET['outline'])) : 'default';
        $identifier = !empty($_GET['id']) ? \sanitize_key(\wp_unslash($_GET['id'])) : null;

        if (!in_array($format, ['json', 'raw'], true)) {
            $this->ajax_not_found($format);
        }

        $props = \wp_unslash($_GET);
        unset($props['action'], $props['outline'], $props['id'], $props['format']);

        $genesis = Genesis::instance();

        $this->setLayout($outline, true);

        if ($identifier === 'main-particle') {
            // Does not exist in WP.
            $this->ajax_not_found($format);
        } elseif (preg_match('`^(.*?)-widget-(.*?)-([\d]+)$`', $identifier, $matches)) {
            // Render widget.
            list(, $sidebar, $type) = $matches;
            $id = 'particle_widget-' . $matches[3];
            $html = Widgets::getAjax($sidebar, $id, $props);

            if ($html === null) {
                $this->ajax_not_found($format);
            }

            $this->ajax_particle_output('widget.' . $type, $identifier, $props, $html, $format);
        } else {
            // Render particle.
            $layout = $this->loadLayout();
            $particle = $layout->find($identifier);
            if (!isset($particle->type) || $particle->type !== 'particle') {
                $this->ajax_not_found($format);
            }

            $context = [
                'Genesis' => $genesis,
                'inContent' => false,
                'ajax' => $props,
            ];

            $block = $this->getContent($particle, $context);
            $type = $particle->type . '.' . $particle->subtype;
            $html = (string) $block;
            $this->ajax_particle_output($type, $identifier, $props, $html, $format);
        }
    }

    /**
     * @param string $type
     * @param string $identifier
     * @param array|object $props
     * @param string $html
     * @param string $format
     */
    protected function ajax_particle_output($type, $identifier, $props, $html, $format)
    {
        ob_clean();

        if ($format === 'raw') {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Particle HTML is rendered server-side content.
            echo $html;
        } else {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'code' => 200,
                'type' => $type,
                'id' => $identifier,
                'props' => (object)$props,
                'html' => $html
            ]);
        }

        \wp_die();
    }

    /**
     * @param string $format
     */
    protected function ajax_not_found($format)
    {
        ob_clean();

        if ($format === 'raw') {
            echo 'Not Found';
        } else {
            header('Content-Type: "application/json; charset=utf-8"');
            echo json_encode([
                'code' => 404,
                'message' => 'Not Found'
            ]);
        }

        \wp_die();
    }

    /**
     * @param  bool $enable
     * @return bool
     * @deprecated 5.1.5
     */
    public function wordpress($enable = null)
    {
        if ($enable) {
            $this->wordpress = (bool) $enable;
        }

        return $this->wordpress;
    }
}
