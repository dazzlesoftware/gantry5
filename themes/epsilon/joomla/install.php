<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Genesis;
use Genesis\Framework\ThemeInstaller;
use Genesis\Loader;
use Joomla\CMS\Factory;
use Joomla\CMS\Filesystem\Folder;
use Joomla\CMS\Installer\Adapter\TemplateAdapter;
use Joomla\CMS\Language\Text;

/**
 * Class Genesis_EpsilonInstallerScript
 */
class Genesis_EpsilonInstallerScript
{
    /** @var string */
    public $requiredGenesisVersion = '5.5';

    /**
     * @param string $type
     * @param object $parent
     * @return bool
     * @throws Exception
     */
    public function preflight($type, $parent)
    {
        if ($type === 'uninstall') {
            return true;
        }

        $manifest = $parent->getManifest();
        $name = Text::_($manifest->name);

        // Prevent installation if Genesis isn't enabled or is too old for this template.
        try {
            if (!class_exists('Genesis\Loader')) {
                throw new RuntimeException(sprintf('Please install Genesis Framework before installing %s template!', $name));
            }

            Loader::setup();

            $genesis = Genesis::instance();

            if (!method_exists($genesis, 'isCompatible') || !$genesis->isCompatible($this->requiredGenesisVersion)) {
                throw new \RuntimeException(sprintf('Please upgrade Genesis Framework to v%s (or later) before installing %s template!', strtoupper($this->requiredGenesisVersion), $name));
            }

        } catch (Exception $e) {
            $app = Factory::getApplication();
            $app->enqueueMessage(Text::sprintf($e->getMessage()), 'error');

            return false;
        }

        return true;
    }

    /**
     * @param string $type
     * @param TemplateAdapter $parent
     * @throws Exception
     */
    public function postflight($type, $parent)
    {
        if ($type === 'uninstall') {
            return true;
        }

        // Delete previous jQuery overrides, those just break things.
        $search = JPATH_ROOT . "/templates/{$parent->getName()}/js/jui";
        if (Folder::exists($search)) {
            Folder::delete($search);
        }

        $installer = new ThemeInstaller($parent);
        $installer->initialize();

        // Install sample data on first install.
        if (in_array($type, array('install', 'discover_install'))) {
            try {
                $installer->installDefaults();

                echo $installer->render('install.html.twig');

            } catch (Exception $e) {
                $app = Factory::getApplication();
                $app->enqueueMessage(Text::sprintf($e->getMessage()), 'error');
            }
        } else {
            echo $installer->render('update.html.twig');
        }

        $installer->finalize();

        return true;
    }

    /**
     * Called by TemplateInstaller to customize post-installation.
     *
     * @param ThemeInstaller $installer
     */
    public function installDefaults(ThemeInstaller $installer)
    {
        // Create default outlines etc.
        $installer->createDefaults();
    }

    /**
     * Called by TemplateInstaller to customize sample data creation.
     *
     * @param ThemeInstaller $installer
     */
    public function installSampleData(ThemeInstaller $installer)
    {
        // Create sample data.
        $installer->createSampleData();
    }
}
