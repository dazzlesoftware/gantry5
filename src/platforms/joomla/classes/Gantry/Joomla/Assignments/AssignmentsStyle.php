<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Joomla\Assignments;

use Gantry\Component\Assignments\AssignmentsInterface;
use Gantry\Debugger;
use Gantry\Framework\Gantry;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class AssignmentsStyle
 * @package Gantry\Joomla\Assignments
 */
class AssignmentsStyle implements AssignmentsInterface
{
    /** @var string */
    public $type = 'style';
    /** @var int */
    public $priority = 2;

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules()
    {
        static $rules;

        if (null === $rules) {
            $rules = [];

            /** @var CMSApplication $application */
            $application = Factory::getApplication();
            $template = $application->getTemplate(true);

            $theme = $template->template;
            $outline = $template->params->get('configuration', !empty($template->id) ? $template->id : $template->params->get('preset', null));

            if (JDEBUG) {
                if (\GANTRY_DEBUGGER) {
                    Debugger::addMessage('Template Style:', 'debug');
                    Debugger::addMessage($template, 'debug');
                }

                if (!$outline) {
                    $application->enqueueMessage('JApplicationSite::getTemplate() was overridden with no specified Gantry 5 outline.', 'debug');
                }
            }

            /** @var UniformResourceLocator $locator */
            $locator = Gantry::instance()['locator'];

            if ($outline && is_dir($locator("gantry-themes://{$theme}/custom/config/{$outline}"))) {
                $rules = ['id' => [$outline => $this->priority]];
            }
        }

        return $rules;
    }

    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function listRules($configuration)
    {
        return [];
    }
}
