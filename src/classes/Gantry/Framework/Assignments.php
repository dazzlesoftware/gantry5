<?php
/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Assignments\AbstractAssignments;

/**
 * Class Assignments
 * @package Gantry\Framework
 */
class Assignments extends AbstractAssignments
{
    /**
     * @return array
     */
    public function types()
    {
        return function_exists('genesis_apply_filters')
            ? genesis_apply_filters('genesis_assignments_types', 'gantry5_assignments_types', [])
            : apply_filters('gantry5_assignments_types', []);
    }

    /**
     * Get assignments page
     *
     * @return array
     */
    public function page()
    {
        return function_exists('genesis_apply_filters')
            ? genesis_apply_filters('genesis_assignments_page', 'gantry5_assignments_page', [])
            : apply_filters('gantry5_assignments_page', []);
    }
}
