<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Module;

use Genesis\Joomla\Object\Finder;
use Genesis\Joomla\Object\Collection;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;

/**
 * Class ModuleFinder
 * @package Genesis\Joomla\Module
 */
class ModuleFinder extends Finder
{
    /** @var string */
    protected string $table = '#__modules';
    /** @var bool */
    protected bool $readonly = true;
    /** @var array */
    protected array $state = [];
    /** @var array */
    protected array $published = [0, 1];
    /** @var int */
    protected int $limit = 0;

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

        return Module::getInstances($ids, $this->readonly);
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

        $this->published = $published;

        return $this;
    }

    /**
     * @return ModuleFinder
     */
    public function particle(): static
    {
        return $this->where('a.module', '=', 'mod_genesis_particle');
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

        /** @var CMSApplication $application */
        $application = Factory::getApplication();
        $user = $application->getIdentity();

        $groups = $user ? $user->getAuthorisedViewLevels() : [];
        if (!$groups) {
            $this->skip = true;

            return $this;
        }

        return $this->where('a.access', 'IN', $groups);
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
        $this->where('client_id', '=', 0)->where('published', 'IN', $this->published)->order('position')->order('ordering');
        foreach ($this->state as $key => $list) {
            foreach ($list as $op => $group) {
                $this->where($key, $op, array_unique($group));
            }
        }
    }
}
