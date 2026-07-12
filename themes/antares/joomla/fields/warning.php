<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

/**
 * Class JFormFieldWarning
 */
class JFormFieldWarning extends JFormField
{
    /** @var string */
    protected $type = 'Warning';

    /**
     * @return string
     * @throws Exception
     */
    protected function getInput()
    {
        $app = Factory::getApplication();
        if ($app->isClient('administrator')) {
            $app->enqueueMessage(Text::_('GANTRY5_THEME_INSTALL_GANTRY'), 'error');
        } else {
            $app->enqueueMessage(Text::_('GANTRY5_THEME_FRONTEND_SETTINGS_DISABLED'), 'warning');
        }

        return '';
    }
}
