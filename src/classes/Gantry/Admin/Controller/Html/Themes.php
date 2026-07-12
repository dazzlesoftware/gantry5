<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Controller\Html;

use Gantry\Admin\ThemeList;
use Gantry\Component\Admin\HtmlController;

/**
 * Class Themes
 * @package Gantry\Admin\Controller\Html
 */
class Themes extends HtmlController
{
    /**
     * @return string
     */
    public function index()
    {
        $this->params['themes'] = (new ThemeList)->getThemes();

        return $this->render('@gantry-admin/pages/themes/themes.html.twig', $this->params);
    }
}
