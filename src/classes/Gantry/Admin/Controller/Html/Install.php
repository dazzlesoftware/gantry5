<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Controller\Html;

use Gantry\Component\Admin\HtmlController;
use Gantry\Framework\ThemeInstaller;

/**
 * Class Install
 * @package Gantry\Admin\Controller\Html
 */
class Install extends HtmlController
{
    /**
     * @return string
     */
    public function index()
    {
        if (!$this->authorize('updates.manage') || !class_exists('\Gantry\Framework\ThemeInstaller')) {
            $this->forbidden();
        }

        $installer = new ThemeInstaller();
        $installer->initialized = true;
        $installer->loadExtension($this->container['theme.name']);
        $installer->installDefaults();
        $installer->installSampleData();
        $installer->finalize();

        $this->params['actions'] = $installer->actions;

        return $this->render('@gantry-admin/pages/install/install.html.twig', $this->params);
    }
}
