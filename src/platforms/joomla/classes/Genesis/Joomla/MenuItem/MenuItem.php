<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\MenuItem;

use Genesis\Joomla\Object\AbstractObject;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;

/**
 * Class ContactDetails
 * @package Genesis\Joomla\MenuItem
 */
class MenuItem extends AbstractObject
{
    /** @var array */
    protected static array $instances = [];
    /** @var string */
    protected static mixed $table = 'Menu';
    /** @var string */
    protected static mixed $order = 'id';

    public function exportSql(): string
    {
        $component = $this->component_id;
        if ($component) {
            $components = static::getComponents();
            $component = $components[$component]->name;

            $array = $this->getFieldValues(['asset_id', 'checked_out', 'checked_out_time']);
            $array['`component_id`'] = '`extension_id`';

            $keys = implode(',', array_keys($array));
            $values = implode(',', array_values($array));

            return "INSERT INTO `#__menu` ($keys)\nSELECT {$values}\nFROM `#__extensions` WHERE `name` = '{$component}';";
        }

        return $this->getCreateSql(['asset_id']) . ';';
    }

    protected static function getComponents(): array
    {
        static $components;

        if (null === $components) {
            $db = Factory::getContainer()->get(DatabaseInterface::class);

            $query = $db->getQuery(true);
            $query->select('extension_id, name')->from('#__extensions');

            $components = $db->setQuery($query)->loadObjectList('extension_id');
        }

        return $components;
    }
}
