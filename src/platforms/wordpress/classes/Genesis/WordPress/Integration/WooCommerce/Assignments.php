<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\Assignments;

use Genesis\Component\Assignments\AssignmentsInterface;

/**
 * Class Assignments
 * @package Genesis\WordPress\Integration\WooCommerce
 */
class AssignmentsWoocommerce implements AssignmentsInterface
{
    /** @var string */
    public string $type = 'woocommerce';
    /** @var int */
    public int $priority = 4;

    /** @var array */
    protected array $context = [
        'is_shop'             => 'Shop Page',
        'is_product'          => 'Product Page',
        'is_product_category' => 'Product Category',
        'is_product_tag'      => 'Product Tag',
        'is_cart'             => 'Cart Page',
        'is_checkout'         => 'Checkout Page',
        'is_account_page'     => 'Customer Account Page'
    ];

    /**
     * Returns list of rules which apply to the current page.
     *
     * @return array
     */
    public function getRules(): array
    {
        $rules = [];

        foreach ($this->context as $var => $label) {
            if ($var() === true) {
                $rules[$var] = $this->priority;
            }
        }

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
        // Get label and items for the context.
        $list = [
            'label' => 'WooCommerce',
            'items' => $this->getItems()
        ];

        return [$list];
    }

    /**
     * @return array
     */
    protected function getItems(): array
    {
        $items = [];
        $context = $this->context;

        foreach ($context as $conditional => $label) {
            $items[] = [
                'name'  => $conditional,
                'label' => $label
            ];
        }

        return $items;
    }

    /**
     * Add WooCommerce to the Page Context list
     *
     * @param $context
     * @return array
     */
    public static function addPageContextItem(mixed $context): mixed
    {
        if (is_array($context)) {
            $context['is_woocommerce'] = 'WooCommerce Page';
        }

        return $context;
    }

    /**
     * Add WooCommerce conditional tag check to the rules
     *
     * @param $rules
     * @param $priority
     * @return array
     */
    public static function addPageContextConditionals(?array $rules, int $priority = 1): array
    {
        if (!isset($rules)) {
            $rules = [];
        }

        if (\is_woocommerce() === true) {
            $rules['is_woocommerce'] = $priority;
        }

        return $rules;
    }
}
