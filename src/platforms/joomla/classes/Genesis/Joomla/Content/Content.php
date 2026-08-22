<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla\Content;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Genesis\Joomla\Category\Category;
use Genesis\Joomla\Object\AbstractObject;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Multilanguage;
use Joomla\CMS\Router\Route;
use Joomla\CMS\User\User;
use Joomla\CMS\User\UserFactoryInterface;
use Joomla\CMS\Table\Table;
use Joomla\Component\Content\Administrator\Extension\ContentComponent;
use Joomla\Component\Content\Site\Helper\RouteHelper;
use Joomla\Component\Content\Site\Model\ArticleModel;

/**
 * Class Content
 * @package Genesis\Joomla\Content
 *
 * @property $images
 * @property $urls
 * @property $attribs
 * @property $metadata
 * @property $modified
 * @property $created
 * @property $publish_up
 * @property $created_by
 * @property $catid
 * @property $introtext
 * @property $fulltext
 * @property $alias
 */
class Content extends AbstractObject
{
    /** @var array */
    protected static array $instances = [];
    /** @var string */
    protected static mixed $table = 'Content';
    /** @var string */
    protected static mixed $order = 'id';

    /**
     * @return bool
     */
    public function initialize(): bool
    {
        if (!parent::initialize()) {
            return false;
        }

        $this->images = json_decode((string) $this->images, false);
        $this->urls = json_decode((string) $this->urls, false);
        $this->attribs = json_decode((string) $this->attribs, false);
        $this->metadata = json_decode((string) $this->metadata, false);

        $nullDate = Factory::getContainer()->get(DatabaseInterface::class)->getNullDate();
        if ($this->modified === $nullDate) {
            $this->modified = $this->created;
        }
        if ($this->publish_up === $nullDate) {
            $this->publish_up = $this->created;
        }

        return true;
    }

    /**
     * @return User
     */
    public function author(): User
    {
        return Factory::getContainer()->get(UserFactoryInterface::class)->loadUserById((int) $this->created_by);
    }

    /**
     * @return Object
     */
    public function category(): Category
    {
        return Category::getInstance((int) $this->catid);
    }

    /**
     * @return array
     */
    public function categories(): array
    {
        $category = $this->category();

        return array_merge($category->parents(), [$category]);
    }

    /**
     * @return string
     */
    public function text(): string
    {
        return $this->introtext . ' ' . $this->fulltext;
    }

    /**
     * @return string
     */
    public function preparedText(): string
    {
        return HTMLHelper::_('content.prepare', $this->text());
    }

    /**
     * @return string
     */
    public function preparedIntroText(): string
    {
        return HTMLHelper::_('content.prepare', (string) $this->introtext);
    }

    /**
     * @return bool
     */
    public function readmore(): bool
    {
        return (bool)\strlen($this->fulltext);
    }

    /**
     * @return string
     */
    public function route(): string
    {
        $category = $this->category();
        // Joomla 5: use namespaced RouteHelper
        require_once JPATH_SITE . '/components/com_content/src/Helper/RouteHelper.php';

        return htmlspecialchars_decode(Route::_(RouteHelper::getArticleRoute($this->id . ':' . $this->alias, $category->id . ':' . $category->alias), false), ENT_COMPAT);
    }

    /**
     * @return bool|string
     */
    public function edit(): string|false
    {
        /** @var CMSApplication $application */
        $application = Factory::getApplication();
        $user = $application->getIdentity();
        $asset = "com_content.article.{$this->id}";

        if ($user && ($user->authorise('core.edit', $asset) || $user->authorise('core.edit.own', $asset))) {
            // Joomla 5: use namespaced RouteHelper and build edit url
            $contentUrl = RouteHelper::getArticleRoute($this->id . ':' . $this->alias, $this->catid);
            $url = $contentUrl . '&task=article.edit&a_id=' . $this->id;

            return htmlspecialchars_decode(Route::_($url), ENT_COMPAT);
        }

        return false;
    }

    /**
     * @param string $file
     * @return string
     */
    public function render(string $file): string
    {
        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];

        return $theme->render($file, ['article' => $this]);
    }

    /**
     * @param string $string
     * @return string
     */
    public function compile(string $string): string
    {
        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];

        return $theme->compile($string, ['article' => $this]);
    }

    /**
     * @param $config
     * @return object
     */
    public function object(array $config = []): object
    {
        $config += [
            'ignore_request' => true
        ];

        $user = Factory::getApplication()->getIdentity();
        $app = Factory::getApplication();
        $params = $app->getParams();

        $model = new ArticleModel($config);
        $model->setState('article.id', $this->id);
        $model->setState('list.offset', 0);
        $model->setState('params', $params);

        // If $pk is set then authorise on complete asset, else on component only
        $asset = empty($this->id) ? 'com_content' : 'com_content.article.' . $this->id;
        if ((!$user->authorise('core.edit.state', $asset)) && (!$user->authorise('core.edit', $asset)))
        {
            $model->setState('filter.published', ContentComponent::CONDITION_PUBLISHED);
            $model->setState('filter.archived', ContentComponent::CONDITION_ARCHIVED);
        }

        $model->setState('filter.language', Multilanguage::isEnabled());

        return $model->getItem($this->id);
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        $properties = $this->getProperties(true) + [
            'category' => [
                'alias' => $this->category()->alias,
                'title' => $this->category()->title
            ],
            'author' => [
                'username' => $this->author()->username,
                'fullname' => $this->author()->name
            ],
        ];

        foreach ($properties as $key => $val) {
            if (str_starts_with($key, '_')) {
                unset($properties[$key]);
            }
        }

        return $properties;
    }

    public function exportSql(): string
    {
        return $this->getCreateSql(['asset_id', 'created_by', 'modified_by', 'checked_out', 'checked_out_time', 'publish_up', 'publish_down', 'version', 'xreference']) . ';';
    }

    protected function fixValue(Table $table, string $k, mixed $v): mixed
    {
        if ($k === '`created`' || $k === '`modified`') {
            $v = 'NOW()';
        } elseif (is_string($v)) {
            $dbo = $table->getDatabase();
            $v = $dbo->quote($v);
        }

        return $v;
    }
}
