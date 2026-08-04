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
 * Class About
 * @package Genesis\Admin\Controller\Html
 */
class About extends HtmlController
{
    /**
     * @return string
     */
    public function index()
    {
        // TODO: Find better way:
        $this->params['info'] = (new ThemeList)->getTheme($this->container['theme.name']);

        return $this->render('@genesis-admin/pages/about/about.html.twig', $this->params);
    }
}
