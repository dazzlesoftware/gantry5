<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Genesis\Admin\Router;
use Genesis\Admin\Theme;
use Genesis\Framework\Genesis;
use Genesis\Joomla\StyleHelper;
use Genesis\Loader;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Form\FormField;

/**
 * Class JFormFieldParticle
 */


class JFormFieldParticle extends FormField
{
    protected $type = 'Particle';
    protected Genesis $container;

    /**
     * @return string
     * @throws Exception
     */
    protected function getInput(): string
    {
        /** @var CMSApplication $application */
        $application = Factory::getApplication();

        // Detect Genesis Framework or fail gracefully.
        if (!class_exists('Genesis\Loader')) {
            $application->enqueueMessage(
                Text::sprintf('MOD_GENESIS_PLUGIN_MISSING', Text::_('MOD_GENESIS_PARTICLE')),
                'error'
            );
            return '';
        }

        if (!defined('GENESIS_ADMIN_PATH')) {
            define('GENESIS_ADMIN_PATH', JPATH_ADMINISTRATOR . '/components/com_genesis');
        }
        if (!defined('GENESISADMIN_PATH')) {
            define('GENESISADMIN_PATH', GENESIS_ADMIN_PATH);
        }

        // Initialize administrator or fail gracefully.
        try {
            Loader::setup();

            $language = $application->getLanguage();
            $language->load('com_genesis', JPATH_ADMINISTRATOR)
                || $language->load('com_genesis', GENESIS_ADMIN_PATH);

            $this->container = Genesis::instance();
            $this->container['router'] = function ($c) {
                return new Router($c);
            };

        } catch (Exception $e) {
            $application->enqueueMessage(
                Text::sprintf($e->getMessage()),
                'error'
            );
            return '';
        }

        // TODO: Use better style detection.
        $style = StyleHelper::getDefaultStyle();

        if (!$style->template) {
            $application->enqueueMessage(
                Text::_('GENESIS_PARTICLE_FIELD_NO_DEFAULT_STYLE'),
                'warning'
            );
        } elseif (!file_exists(JPATH_SITE . "/templates/{$style->template}/genesis/theme.yaml")) {
            $application->enqueueMessage(
                Text::sprintf('GENESIS_PARTICLE_FIELD_NO_GENESIS_STYLE', $style->title),
                'warning'
            );
        }

        /** @var Router $router */
        $router = $this->container['router'];
        $router->setTheme($style->template, null)->load();

        $field = [
            'default' => true,
            'scope' => '',
            'name' => $this->name,
            'field' => [
                'type' => 'genesis.particle',
                'label' => 'Particle',
                'class' => 'input-small',
                'picker_label' => 'Pick a Particle',
                'overridable' => false
            ],
            'value' => json_decode($this->value, true)
        ];

        /** @var Theme $adminTheme */
        $adminTheme = $this->container['admin.theme'];

        $params = [
            'content' => $adminTheme->render('@genesis-admin/forms/fields/genesis/particle.html.twig', $field)
        ];

        return $adminTheme->render('@genesis-admin/partials/layout.html.twig', $params);
    }
}
