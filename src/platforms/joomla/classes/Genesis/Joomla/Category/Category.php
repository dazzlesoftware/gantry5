<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Category;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Genesis\Joomla\Object\AbstractObject;
use Joomla\CMS\Router\Route;
use Joomla\Component\Content\Site\Helper\RouteHelper;
use Joomla\CMS\Table\Table;

/**
 * Class Category
 * @package Genesis\Joomla\Category
 *
 * @property $extension
 * @property $parent_id
 * @property $path
 * @property $alias
 * @property $params
 * @property $metadata
 */
class Category extends AbstractObject
{
    /** @var array */
    protected static array $instances = [];
    /** @var string */
    protected static mixed $table = 'Category';
    /** @var string */
    protected static mixed $order = 'lft';

    /**
     * @return bool
     */
    public function initialize(): bool
    {
        if (!parent::initialize()) {
            return false;
        }

        $this->params = json_decode((string) $this->params, false);
        $this->metadata = json_decode((string) $this->metadata, false);

        return true;
    }

    /**
     * @return Object|null
     */
    public function parent(): ?self
    {
        if ($this->alias !== $this->path)
        {
            $parent = Category::getInstance($this->parent_id);
        }

        return isset($parent) && $parent->extension === $this->extension ? $parent : null;
    }

    /**
     * @return array
     */
    public function parents(): array
    {
        $parent = $this->parent();

        return $parent ? array_merge($parent->parents(), [$parent]) : [];
    }

    /**
     * @return string
     */
    public function route(): string
    {
        // Joomla 5: use namespaced RouteHelper
        require_once JPATH_SITE . '/components/com_content/src/Helper/RouteHelper.php';

        return Route::_(RouteHelper::getCategoryRoute($this->id . ':' . $this->alias), false);
    }

    /**
     * @param string $file
     * @return mixed
     */
    public function render(string $file): string
    {
        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];

        return $theme->render($file, ['category' => $this]);
    }

    /**
     * @param string $string
     * @return mixed
     */
    public function compile(string $string): string
    {
        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];

        return $theme->compile($string, ['category' => $this]);
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        $properties = $this->getProperties(true);

        foreach ($properties as $key => $val) {
            if (str_starts_with($key, '_')) {
                unset($properties[$key]);
            }
        }

        return $properties;
    }

    public function exportSql(): string
    {
        return $this->getCreateSql(['asset_id', 'checked_out', 'checked_out_time', 'created_user_id', 'modified_user_id', 'hits', 'version']) . ';';
    }

    protected function fixValue(Table $table, string $k, mixed $v): mixed
    {
        if ($k === '`created_time`' || $k === '`modified_time`') {
            $v = 'NOW()';
        } elseif (is_string($v)) {
            $dbo = $table->getDatabase();
            $v = $dbo->quote($v);
        }

        return $v;
    }
}
