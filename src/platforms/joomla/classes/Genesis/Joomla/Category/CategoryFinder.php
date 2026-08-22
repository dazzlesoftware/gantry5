<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Category;

use Genesis\Joomla\Object\Finder;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Genesis\Joomla\Object\Collection;

/**
 * Class CategoryFinder
 * @package Genesis\Joomla\Category
 */
class CategoryFinder extends Finder
{
    /** @var string */
    protected string $table = '#__categories';
    /** @var string */
    protected string $extension = 'com_content';
    /** @var bool */
    protected bool $readonly = true;

    /**
     * Makes all created objects as readonly.
     *
     * @param bool $readonly
     * @return $this
     */
    public function readonly(bool $readonly = true): static
    {
        $this->readonly = (bool)$readonly;

        return $this;
    }

    /**
     * @param bool $object
     * @return array|\Genesis\Joomla\Object\Collection
     */
    public function find(bool $object = true): array|Collection
    {
        $ids = parent::find();

        if (!$object) {
            return $ids;
        }

        return Category::getInstances($ids, $this->readonly);
    }

    /**
     * @param int|int[] $ids
     * @param int $levels
     * @return $this
     */
    public function id(int|array $ids, int $levels = 0): static
    {
        if ($ids && $levels) {
            $ids = (array) $ids;

            $db = $this->db;
            array_walk($ids, static function (mixed &$item) use ($db): void { $item = $db->quote($item); });
            $idList = implode(',', $ids);

            // Create a subquery for the subcategory list
            $subQuery = $this->db->getQuery(true)
                ->select('sub.id')
                ->from('#__categories AS sub')
                ->join('INNER', '#__categories AS this ON sub.lft > this.lft AND sub.rgt < this.rgt')
                ->where("this.id IN ({$idList})");

            if (is_numeric($levels)) {
                $subQuery->where('sub.level <= this.level + ' . (int) $levels);
            }

            // Add the subquery to the main query
            $this->query->where("(a.id IN ({$idList}) OR a.id IN ({$subQuery->__toString()}))");
        } else {
            $this->where('a.id', 'IN', $ids);
        }

        return $this;
    }

    /**
     * @param string|bool|int $language
     * @return $this
     */
    public function language(string|bool|int $language = true): static
    {
        if (!$language) {
            return $this;
        }
        if ($language === true || is_numeric($language)) {
            /** @var CMSApplication $application */
            $application = Factory::getApplication();

            $language = $application->getLanguage()->getTag();
        }
        return $this->where('a.language', 'IN', [$language, '*']);
    }

    /**
     * @param int|int[] $published
     * @return $this
     */
    public function published(int|array $published = 1): static
    {
        if (!is_array($published)) {
            $published = (array) ((int)$published);
        }
        return $this->where('a.published', 'IN', $published);
    }

    /**
     * @param bool $authorised
     * @return $this
     */
    public function authorised(bool $authorised = true): static
    {
        if (!$authorised) {
            return $this;
        }

        // Ignore unpublished categories.
        $unpublished = self::getUnpublished($this->extension);

        if ($unpublished) {
            $this->where('a.id', 'NOT IN', $unpublished);
        }

        /** @var CMSApplication $app */
        $app = Factory::getApplication();

        // Check authorization.
        $user = $app->getIdentity();
        $groups = $user ? $user->getAuthorisedViewLevels() : [];
        if (!$groups) {
            $this->skip = true;

            return $this;
        }

        return $this->where('a.access', 'IN', $groups);
    }

    /**
     * @param string $extension
     * @return $this
     */
    public function extension(string $extension): static
    {
        $this->extension = static::getExtension($extension);

        return $this->where('a.extension', '=', $this->extension);
    }

    /**
     * @param string $extension
     * @return string
     */
    public static function getExtension(string $extension): string
    {
        static $map = [
            'article' => 'com_content',
            'articles' => 'com_content',
            'content' => 'com_content',
        ];

        if (isset($map[$extension])) {
            $extension = $map[$extension];
        }

        return $extension;
    }

    /**
     * @param $extension
     * @return array
     */
    public static function getUnpublished(string $extension): array
    {
        static $list = null;

        if ($list === null) {
            $db = Factory::getContainer()->get(DatabaseInterface::class);

            $query = $db->getQuery(true)
                ->select('cat.id AS id')
                ->from('#__categories AS cat')
                ->join('LEFT', '#__categories AS parent ON cat.lft BETWEEN parent.lft AND parent.rgt')
                ->where('parent.extension = ' . $db->quote(static::getExtension($extension)))
                ->where('parent.published != 1 AND cat.published < 1')
                ->group('cat.id');

            $db->setQuery($query);
            $list = $db->loadColumn() ?: [];
        }

        return $list;
    }
}
