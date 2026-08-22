<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Contact;

use Genesis\Joomla\Object\AbstractObject;
use Joomla\CMS\Table\Table;

/**
 * Class Contact
 * @package Genesis\Joomla\Contact
 */
class Contact extends AbstractObject
{
    /** @var array */
    protected static array $instances = [];
    /** @var string */
    protected static mixed $table = 'ContactTable';
    protected static string $tablePrefix = 'Joomla\Component\Contact\Administrator\Table\\';
    /** @var string */
    protected static mixed $order = 'id';

    public function exportSql(): string
    {
        return $this->getCreateSql(['asset_id', 'checked_out', 'checked_out_time', 'created_by', 'modified_by', 'publish_up', 'publish_down', 'version', 'hits']) . ';';
    }

    /**
     * Method to get the table object.
     *
     * @return  Table  The table object.
     */
    protected static function getTable(): Table
    {
        return parent::getTable();
    }
}
