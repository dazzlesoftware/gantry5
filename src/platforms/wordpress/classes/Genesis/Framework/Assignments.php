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
use Genesis\Component\Event\Event;

/**
 * Class Assignments
 * @package Genesis\Framework
 */
class Assignments extends AbstractAssignments
{
    /** @var string */
    protected string $platform = 'WordPress';

    /**
     * Assignments constructor.
     * @param string|null $configuration
     */
    public function __construct(?string $configuration = null)
    {
        parent::__construct($configuration);

        // Deal with special language assignments.
        $this->specialFilterMethod = static function(array $candidate, array $match, array $page): bool {
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
     * @return array
     */
    public function types(): array
    {
        $types = [
            'context',
            'menu',
            'language',
            'post',
            'taxonomy',
            'archive'
        ];

        $genesis = Genesis::instance();

        // Use a concrete event with declared property to avoid PHP 8.2+ dynamic property deprecations.
        $event = new class extends Event {
            /** @var array */
            public array $types = [];
        };
        $event->types = $types;

        $genesis->fireEvent('assignments.types', $event);

        return \apply_filters('genesis_assignments_types', $event->types);
    }

    /**
     * @return array
     */
    public function getPage(): array
    {
        $list = parent::getPage();

        \do_action('genesis_assignments_page', $list);

        return $list;
    }
}
