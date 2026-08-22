<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Genesis\Framework\ThemeInstaller;

defined('ABSPATH') or die;

/**
 * Class Genesis_LexiconInstallerScript
 */
class Genesis_LexiconInstallerScript
{
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
