<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;
use Genesis\Debugger;
use Genesis\Framework\Genesis;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class AssignmentsStyle
 * @package Genesis\Joomla\Assignments
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
    public function getRules(): array
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
                if (\GENESIS_DEBUGGER) {
                    Debugger::addMessage('Template Style:', 'debug');
                    Debugger::addMessage($template, 'debug');
                }

                if (!$outline) {
                    $application->enqueueMessage('JApplicationSite::getTemplate() was overridden with no specified Genesis outline.', 'debug');
                }
            }

            /** @var UniformResourceLocator $locator */
            $locator = Genesis::instance()['locator'];

            if ($outline && is_dir($locator("genesis-themes://{$theme}/custom/config/{$outline}"))) {
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
    public function listRules(?string $configuration): array
    {
        return [];
    }
}
