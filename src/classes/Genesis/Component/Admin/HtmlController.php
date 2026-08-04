<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Admin;

use Genesis\Admin\Theme;
use Genesis\Component\Controller\HtmlController as BaseController;
use Genesis\Framework\Platform;

/**
 * Class HtmlController
 * @package Genesis\Component\Admin
 */
abstract class HtmlController extends BaseController
{
    /**
     * @param string|array $file
     * @param array $context
     * @return string
     */
    public function render($file, array $context = [])
    {
        /** @var Theme $theme */
        $theme = $this->container['admin.theme'];

        return $theme->render($file, $context);
    }

    /**
     * @param string $action
     * @param string $id
     * @return boolean
     */
    public function authorize($action, $id = null)
    {
        /** @var Platform $platform */
        $platform = $this->container['platform'];

        return $platform->authorize($action, $id);
    }
}
