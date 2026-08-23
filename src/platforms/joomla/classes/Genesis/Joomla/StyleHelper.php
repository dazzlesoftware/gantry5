<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla;

use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Theme\ThemeDetails;
use Genesis\Framework\Genesis;
use Genesis\Framework\ThemeInstaller;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Table\Table;
use Joomla\Component\Templates\Administrator\Model\StyleModel; // Joomla 4
use Joomla\Component\Templates\Administrator\Table\StyleTable; // Joomla 4
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Joomla style helper.
 */
class StyleHelper
{
    /**
     * @param int|array|null $id
     * @return StyleTable|\TemplatesTableStyle
     */
    public static function getStyle(int|array|null $id = null): Table
    {
        $model = static::loadModel();
        $style = $model->getTable('Style');

        if (null !== $id) {
            if (!is_array($id)) {
                $id = ['id' => $id, 'client_id' => 0];
            }

            $style->load($id);
        }

        return $style;
    }

    /**
     * @param string $template
     * @return array
     */
    public static function loadStyles(string $template): array
    {
        $db = Factory::getContainer()->get(DatabaseInterface::class);

        $query = $db
            ->getQuery(true)
            ->select('s.id, s.template, s.home, s.title AS long_title, s.params')
            ->from('#__template_styles AS s')
            ->where('s.client_id = 0')
            ->where("s.template = {$db->quote($template)}")
            ->order('s.id');

        $db->setQuery($query);

        $list = $db->loadObjectList('id') ?: [];

        foreach ($list as $id => &$style) {
            $style->title = preg_replace('/' . preg_quote(Text::_($style->template), '/') . '\s*-\s*/u', '', $style->long_title);
            $style->home = $style->home && $style->home !== '1' ? $style->home : (bool)$style->home;
        }

        return $list;
    }

    /**
     * @return StyleTable|\TemplatesTableStyle
     */
    public static function getDefaultStyle(): Table
    {
        return static::getStyle(['home' => 1, 'client_id' => 0]);
    }

    /**
     * @param ThemeDetails|StyleTable|\TemplatesTableStyle $style
     * @param string $old
     * @param string $new
     */
    public static function copy(ThemeDetails|Table $style, string|int $old, string|int $new): void
    {
        if ($style instanceof ThemeDetails) {
            $name = $style->name;
        } else {
            $name = $style->template;
        }

        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $oldPath = $locator->findResource('genesis-config://' . $old, true, true);
        $newPath = $locator->findResource('genesis-config://' . $new, true, true);

        if (is_string($oldPath) && is_string($newPath) && file_exists($oldPath)) {
            Folder::copy($oldPath, $newPath);
        }

        $installer = new ThemeInstaller($name);
        $installer->updateStyle((string) $new, ['configuration' => $new]);
    }

    /**
     * @param int|array $id
     * @param mixed $preset
     * @throws \Exception
     */
    public static function update(int|array $id, mixed $preset): void
    {
        $style = static::getStyle($id);

        $installer = new ThemeInstaller($style->template);
        $installer->updateStyle($id, ['configuration' => $id, 'preset' => $preset]);
    }

    /**
     * @param string $id
     */
    public static function delete(string $id): void
    {
        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $path = $locator->findResource('genesis-config://' . $id, true, true);

        if (is_dir($path)) {
            Folder::delete($path, true);
        }
    }

    /**
     * @param string $name
     * @return StyleModel|\TemplatesModelStyle
     */
    public static function loadModel(string $name = 'Style'): object
    {
        static $model = [];

        if (!isset($model[$name])) {
            // Joomla 5+ (use modern component boot and MVC factory)
            $application = Factory::getApplication();
            $model[$name] = $application->bootComponent('com_templates')
                ->getMVCFactory()
                ->createModel($name, 'Administrator', ['ignore_request' => true]);
        }

        return $model[$name];
    }
}
