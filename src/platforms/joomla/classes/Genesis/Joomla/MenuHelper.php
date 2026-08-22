<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Table\Menu;
use Joomla\CMS\Table\MenuType;
use Joomla\CMS\Table\Table;
use Joomla\Component\Menus\Administrator\Model\ItemModel; // Joomla 4
use Joomla\Component\Menus\Administrator\Table\MenuTable; // Joomla 4
use Joomla\Component\Menus\Administrator\Table\MenuTypeTable; // Joomla 4

/**
 * Joomla style helper.
 */
class MenuHelper
{
    /**
     * @param int|array|null $id
     * @return \JTableMenu|MenuTable|\Joomla\CMS\Table\Menu
     */
    public static function getMenu(int|array|null $id = null): Table
    {
        $model = static::loadModel();
        $table = $model->getTable();

        if (null !== $id) {
            if (!is_array($id)) {
                $id = ['id' => $id, 'client_id' => 0];
            }

            $table->load($id);
        }

        return $table;
    }

    /**
     * @param int|array|null $id
     * @return \JTableMenuType|MenuTypeTable|\Joomla\CMS\Table\MenuType
     */
    public static function getMenuType(string|int|array|null $id = null): Table
    {
        $model = static::loadModel();
        $table = $model->getTable('MenuType');

        if (null !== $id) {
            if (!is_array($id)) {
                $id = ['menutype' => $id];
            }

            $table->load($id);
        }

        return $table;
    }

    /**
     * @param string $name
     * @return ItemModel|\MenusModelItem
     */
    private static function loadModel(string $name = 'Item'): object
    {
        static $model = [];

        if (!isset($model[$name])) {
            // Joomla 5+ (use modern component boot and MVC factory)
            $application = Factory::getApplication();
            $model[$name] = $application->bootComponent('com_menus')
                ->getMVCFactory()
                ->createModel($name, 'Administrator', ['ignore_request' => true]);
        }

        return $model[$name];
    }
}
