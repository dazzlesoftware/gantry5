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
        // Fixed: Added WordPress prefix 'gantry5_' to the hook
        return apply_filters('gantry5_assignments_types', []);
    }

    /**
     * Get assignments page
     *
     * @return array
     */
    public function page()
    {
        // Fixed: Added WordPress prefix 'gantry5_' to the hook
        return apply_filters('gantry5_assignments_page', []);
    }
}
