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
 */
class Assignments extends AbstractAssignments
{
    protected $platform = 'Grav';

    /**
     * Assignments constructor.
     * @param string|null $configuration
     */
    public function __construct($configuration = null)
    {
        parent::__construct($configuration);

        // Deal with special language assignments.
        $this->specialFilterMethod = static function($candidate, $match, $page) {
            if (!empty($candidate['language']) && !empty($page['language'])) {
                // Always drop candidate if language does not match.
                if (empty($match['language'])) {
                    return false;
                }

                unset($candidate['language'], $match['language']);
                $candidate = array_filter($candidate);

                // Special check for the default outline of the language.
                return empty($candidate) || !empty($match);
            }

            return true;
        };
    }

    /**
     * Return list of assignment types.
     *
     * @return array
     */
    public function types()
    {
        return ['page', 'language', 'type'];
    }
}
