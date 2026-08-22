<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Grav\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;
use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Plugin\AdminPlugin;

/**
 * Class AssignmentsType
 * @package Genesis\Grav\Assignments
 */
class AssignmentsType implements AssignmentsInterface
{
    public $type = 'type';
    public $priority = 2;

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules(): array
    {
        $grav = Grav::instance();

        /** @var PageInterface $page */
        $page = $grav['page'];

        $rules[$page->template()] = $this->priority;

        return [$rules];
    }

    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function listRules(?string $configuration): array
    {
        // Get label and items for each menu
        $list = [
                'label' => 'Page Types',
                'items' => $this->getItems()
        ];

        return [$list];
    }

    /**
     * @return array
     */
    protected function getItems()
    {
        $pageTypes = AdminPlugin::pagesTypes();

        $items = [];
        foreach ($pageTypes as $name => $title) {
            $items[] = [
                'name' => $name,
                'label' => ucfirst($title),
            ];
        }

        return $items;
    }
}
