<?php
// phpcs:disable WordPress.Security.NonceVerification.Missing,WordPress.Security.EscapeOutput.OutputNotEscaped,WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Widget;

defined('ABSPATH') || exit;

use Genesis\Admin\Router;
use Genesis\Component\Config\Config;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Genesis\Admin\Theme as AdminTheme;

/**
 * Class Particle
 * @package Genesis\WordPress\Widget
 */
class Particle extends \WP_Widget
{
    /** @var bool */
    public $genesis = true;

    /** @var Genesis */
    protected $container;
    /** @var array */
    protected $content = [];

    public function __construct()
    {
        global $pagenow;

        parent::__construct(
            'particle_widget',
            __( 'Genesis Particle', 'genesis' ),
            [
                'description' => __( 'Displays Genesis particle instance in a widget block.', 'genesis' ),
                'genesis' => true
            ]
        );

        try {
            $this->container = Genesis::instance();
        } catch (\Exception $e) {}

        $ajax = $pagenow === 'admin-ajax.php' && isset($_POST['action']) && $_POST['action'] === 'save-widget';
        if (\is_admin() && (in_array($pagenow, ['widgets.php', 'customize.php']) || $ajax)) {
            // Initialize administrator if already not done that.
            $this->initialiseGenesis();
        }
    }

    /**
     * Initialise Genesis
     */
    public function initialiseGenesis()
    {
        if (!defined('GENESIS_ADMIN_PATH')) {
            define('GENESIS_ADMIN_PATH', GENESIS_PATH . '/admin');
        }
        if (!defined('GENESISADMIN_PATH')) {
            define('GENESISADMIN_PATH', GENESIS_ADMIN_PATH);
        }
        if (!isset($this->container['router'])) {
            $router = new Router($this->container);
            $router->boot()->load();

            $this->container['router'] = $router;

            /** @var AdminTheme $theme */
            $theme = $this->container['admin.theme'];
            $theme->render('@genesis-admin/partials/layout.html.twig', ['content' => '']);
        }
    }

    /**
     * Outputs the content of the widget.
     *
     * @param array $args
     * @param array $instance
     */
    public function widget($args, $instance)
    {
        if (!is_array($instance)) {
            $instance = [];
        }

        $sidebar = isset($args['id']) ? (string)$args['id'] : '';
        $widget_id = isset($args['widget_id']) ? preg_replace('/\D/', '', $args['widget_id']) : null;
        $md5 = md5(json_encode($instance));
        $id = isset($instance['id']) ? $instance['id'] : ($widget_id ?: "widget-{$md5}");

        if (!isset($this->content[$md5])) {
            /** @var Theme $theme */
            $theme = $this->container['theme'];

            $instance += [
                'type' => 'particle',
                'particle' => 'undefined',
                'options' =>  ['particle' => []],
            ];

            $type = $instance['type'];
            $particle = $instance['particle'];

            if ($this->container->debug()) {
                /** @var Config $config */
                $config = $this->container['config'];
                $enabled_outline = $config->get("particles.{$particle}.enabled", true);
                $enabled = isset($instance['options']['particle']['enabled']) ? $instance['options']['particle']['enabled'] : true;
                $location = (!$enabled_outline ? 'Outline' : (!$enabled ? 'Widget' : null));

                if ($location) {
                    echo $args['before_widget'];
                    echo '<div class="alert alert-error">The Particle has been disabled from the ' . $location . ' and won\'t render.</div>';
                    echo $args['after_widget'];
                    return;
                }
            }

            $object = (object) [
                'id' => "{$sidebar}-widget-{$particle}-{$id}",
                'type' => $type,
                'subtype' => $particle,
                'attributes' => $instance['options']['particle'],
            ];

            $context = [
                'Genesis' => $this->container,
                'inContent' => true
            ];

            if (isset($args['ajax'])) {
                $context['ajax'] = $args['ajax'];
            }

            $this->content[$md5] = $theme->getContent($object, $context);
        }

        $content = $this->content[$md5];

        /** @var Document $document */
        $document = $this->container['document'];
        $document->addBlock($content);

        $html = \apply_filters('widget_content', $content->toString());

        if (trim($html)) {
            echo $args['before_widget'];
            echo $html;
            echo $args['after_widget'];
        }
    }

    /**
     * Outputs the options form on admin.
     *
     * @param array $instance The widget options
     */
    public function form($instance)
    {
        $this->initialiseGenesis();

        $field = [
            'layout' => 'input',
            'scope' => '',
            'name' => $this->get_field_name('particle'),
            'field' => [
                'type' => 'genesis.particle',
                'class' => 'input-small',
                'picker_label' => __('Pick a Particle', 'genesis'),
                'overridable' => false
            ],
            'value' => is_array($instance) ? $instance : []
        ];

        $title = !empty($instance['title']) ? $instance['title'] : '';
        $fieldId = $this->get_field_id('title');
        $fieldName = $this->get_field_name('title');

        echo "<input id=\"{$fieldId}\" name=\"{$fieldName}\" type=\"hidden\" value=\"" . \esc_attr($title) . '" />';


        /** @var AdminTheme $theme */
        $theme = $this->container['admin.theme'];

        $params = [
            'content' => $theme->render('@genesis-admin/forms/fields/genesis/particle.html.twig', $field)
        ];

        echo '<p>' . \__('Clic§k on the button below to choose a Particle.', 'genesis') . '</p>';

        echo $theme->render('@genesis-admin/partials/inline.html.twig', $params);
    }

    /**
     * Processing widget options on save.
     *
     * @param array $new_instance The new options
     * @param array $old_instance The previous options
     * @return array
     */
    public function update($new_instance, $old_instance)
    {
        $instance = isset($new_instance['particle']) ? json_decode($new_instance['particle'], true) : [];
        if ($instance == null) {
            $instance = $new_instance;
        }
        return $instance;
    }
}
