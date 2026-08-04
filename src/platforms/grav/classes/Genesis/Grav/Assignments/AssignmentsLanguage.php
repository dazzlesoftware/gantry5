<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Grav\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;
use Grav\Common\Grav;
use Grav\Common\Language\Language;
use Grav\Common\Language\LanguageCodes;
use Grav\Common\Page\Interfaces\PageInterface;

/**
 * Class AssignmentsLanguage
 * @package Genesis\Grav\Assignments
 */
class AssignmentsLanguage implements AssignmentsInterface
{
    /** @var string */
    public $type = 'language';
    /** @var int */
    public $priority = 1;

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules()
    {
        $grav = Grav::instance();

        /** @var Language $language */
        $language = $grav['language'];
        if (!$language->enabled()) {
            return [];
        }

        $tag = $language->getActive() ?: $language->getDefault();
        $rules[$tag] = $this->priority;

        return [$rules];
    }

    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function listRules($configuration)
    {
        $grav = Grav::instance();

        /** @var Language $language */
        $language = $grav['language'];
        if (!$language->enabled()) {
            return [];
        }

        // Get label and items for each menu
        $list = [
                'label' => 'Languages',
                'items' => $this->getItems($language)
        ];

        return [$list];
    }

    /**
     * @param Language $language
     * @return array
     */
    protected function getItems(Language $language)
    {
        $languages = $language->getLanguages();
        $languages = LanguageCodes::getNames($languages);

        $items = [];

        /** @var PageInterface $page */
        foreach ($languages as $code => $name) {
            $items[] = [
                'name' => $code,
                'label' => "{$name['nativeName']} ({$code})",
            ];
        }

        return $items;
    }
}
