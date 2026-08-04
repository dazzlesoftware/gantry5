<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Assignments;

/**
 * Class AssignmentsArchive
 * @package Genesis\WordPress\Assignments
 */
class AssignmentsArchive extends AssignmentsTaxonomy
{
    /** @var string */
    public $type = 'archive';
    /** @var string */
    public $label = 'Archives: %s';
    /** @var int */
    public $priority = 6;
}
