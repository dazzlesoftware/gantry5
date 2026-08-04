<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Assignments;

/**
 * Interface AssignmentsInterface
 * @package Genesis\Component\Assignments
 */
interface AssignmentsInterface
{
    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules();

    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function listRules($configuration);
}
