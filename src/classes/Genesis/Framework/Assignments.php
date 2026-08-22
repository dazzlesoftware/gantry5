<?php

declare(strict_types=1);
/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Assignments\AbstractAssignments;

/**
 * Class Assignments
 * @package Genesis\Framework
 */
class Assignments extends AbstractAssignments
{
    /**
     * @return array
     */
    public function types(): array
    {
        return apply_filters('genesis_assignments_types', []);
    }

    /**
     * Get assignments page
     *
     * @return array
     */
    public function page()
    {
        return apply_filters('genesis_assignments_page', []);
    }
}
