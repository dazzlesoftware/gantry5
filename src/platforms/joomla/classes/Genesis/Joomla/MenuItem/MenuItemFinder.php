<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\MenuItem;

use Genesis\Joomla\Object\Collection;
use Genesis\Joomla\Object\Finder;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;

/**
 * Class MenuItemFinder
 * @package Genesis\Joomla\MenuItem
 */
class MenuItemFinder extends Finder
{
    /** @var string */
    protected string $table = '#__menu';
    /** @var bool */
    protected bool $readonly = true;
    /** @var array */
    protected array $state = [];

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
     * @return Collection|string[]
     */
    public function find(bool $object = true): array|Collection
    {
        $ids = parent::find();

        if (!$object) {
            return $ids;
        }

        return MenuItem::getInstances($ids, $this->readonly);
    }

    /**
     * @param int|int[] $ids
     * @param bool $include
     * @return $this
     */
    public function id(int|array $ids, bool $include = true): static
    {
        return $this->addToGroup('a.id', $ids, $include);
    }

    /**
     * @param string|int|bool $language
     * @return $this
     */
    public function language(string|int|bool $language = true): static
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
        if (!\is_array($published)) {
            $published = [(int)$published];
        }
        return $this->where('a.published', 'IN', $published);
    }

    /**
     * @param string $key
     * @param int|int[] $ids
     * @param bool $include
     * @return $this
     */
    protected function addToGroup(string $key, int|array $ids, bool $include = true): static
    {
        $ids = (array) $ids;
        $op = $include ? 'IN' : 'NOT IN';

        if (isset($this->state[$key][$op])) {
            $this->state[$key][$op] = array_merge($this->state[$key][$op], $ids);
        } else {
            $this->state[$key][$op] = $ids;
        }

        return $this;
    }

    protected function prepare(): void
    {
        foreach ($this->state as $key => $list) {
            foreach ($list as $op => $group) {
                $this->where($key, $op, array_unique($group));
            }
        }
    }
}
