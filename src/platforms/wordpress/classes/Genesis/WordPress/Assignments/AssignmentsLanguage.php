<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;
use Genesis\WordPress\MultiLanguage\MultiLantuageInterface;
use Genesis\WordPress\MultiLanguage\PolyLang;
use Genesis\WordPress\MultiLanguage\WordPress;
use Genesis\WordPress\MultiLanguage\Wpml;

/**
 * Class AssignmentsLanguage
 * @package Genesis\WordPress\Assignments
 */
class AssignmentsLanguage implements AssignmentsInterface
{
    /** @var string */
    public $type = 'language';
    /** @var int */
    public $priority = 1;

    /** @var MultiLantuageInterface */
    protected $adapter;

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules()
    {
        $code = $this->getAdapter()->getCurrentLanguage();
        $rules[$code] = $this->priority;

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
        $items = $this->getAdapter()->getLanguageOptions();

        // Get label and items for each menu
        $list = [
                'label' => 'Languages',
                'items' => $items
        ];

        return [$list];
    }

    /**
     * @return MultiLantuageInterface|PolyLang|WordPress|Wpml
     */
    protected function getAdapter()
    {
        if (!$this->adapter) {
            if (Wpml::enabled()) {
                $this->adapter = new Wpml;
            } elseif (PolyLang::enabled()) {
                $this->adapter = new PolyLang;
            } else {
                $this->adapter = new WordPress;
            }
        }

        return $this->adapter;
    }
}
