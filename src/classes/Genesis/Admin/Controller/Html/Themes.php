<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html;

use Genesis\Admin\ThemeList;
use Genesis\Component\Admin\HtmlController;

/**
 * Class Themes
 * @package Genesis\Admin\Controller\Html
 */
class Themes extends HtmlController
{
    /**
     * @return string
     */
    public function index()
    {
        $this->params['themes'] = (new ThemeList)->getThemes();

        return $this->render('@genesis-admin/pages/themes/themes.html.twig', $this->params);
    }
}
