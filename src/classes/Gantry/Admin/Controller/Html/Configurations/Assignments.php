<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Controller\Html\Configurations;

use Gantry\Admin\Events\AssigmentsEvent;
use Gantry\Component\Admin\HtmlController;
use Gantry\Framework\Assignments as AssignmentsObject;

/**
 * Class Assignments
 * @package Gantry\Admin\Controller\Html\Configurations
 */
class Assignments extends HtmlController
{
    /**
     * @return string
     */
    public function index()
    {
        $outline = $this->params['outline'];

        if ($this->hasAssignments($outline)) {
            $assignments = new AssignmentsObject($outline);

            $this->params['assignments'] = $assignments->get();
            $this->params['options'] = $assignments->assignmentOptions();
            $this->params['assignment'] = $assignments->getAssignment();
        }

        return $this->render('@gantry-admin/pages/configurations/assignments/assignments.html.twig', $this->params);
    }

    /**
     * @return string
     */
    public function store()
    {
        // Authorization.
        if (!$this->authorize('outline.assign')) {
            $this->forbidden();
        }

        $outline = $this->params['outline'];
        if (!$this->hasAssignments($outline)) {
            $this->undefined();
        }

        if (!$this->request->post->get('_end')) {
            throw new \OverflowException("Incomplete data received. Please increase the value of 'max_input_vars' variable (in php.ini or .htaccess)", 400);
        }

        // Save assignments.
        $assignments = new AssignmentsObject($outline);
        $assignments->save($this->request->post->getArray('assignments'));

        // Fire save event.
        $event = new AssigmentsEvent();
        $event->Genesis = $this->container;
        $event->theme = $this->container['theme'];
        $event->controller = $this;
        $event->assignments = $assignments;
        $this->container->fireEvent('admin.assignments.save', $event);

        return '';
    }

    /**
     * @param string $outline
     * @return bool
     */
    protected function hasAssignments($outline)
    {
        // Default outline and system outlines cannot have assignments.
        return $outline !== 'default' && $outline[0] !== '_';
    }
}
