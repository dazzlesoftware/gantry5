<?php

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
 *
 * v1: outlines are assigned by phpBB "page type" only (index, viewforum, viewtopic, ...).
 * phpBB has no page tree / menu manager to assign against, unlike Joomla, WordPress or Grav.
 */
class Assignments extends AbstractAssignments
{
    protected $platform = 'phpBB';

    /**
     * @return array
     */
    public function types()
    {
        return ['type'];
    }
}
