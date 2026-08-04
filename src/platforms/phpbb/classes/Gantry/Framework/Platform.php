<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Position\Module;
use Gantry\Component\Position\Position;
use Gantry\Debugger;
use Gantry\Framework\Base\Platform as BasePlatform;
use Gantry\phpBB\Runtime;
use DazzleSoftware\Toolbox\DI\Container;

/**
 * The Platform Configuration class contains configuration information.
 *
 * @author Dazzle Software https://dazzlesoftware.org
 * @license MIT
 */
class Platform extends BasePlatform
{
    /** @var string */
    protected $name = 'phpbb';
    /** @var array */
    protected $features = ['fontawesome' => false];

    /**
     * Platform constructor.
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        parent::__construct($container);

        $this->items['streams'] += [
            'Genesis-positions' => [
                'type' => 'ReadOnlyStream',
                'prefixes' => [
                    '' => [$this->getCachePath() . '/positions']
                ]
            ]
        ];
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return \defined('PHPBB_VERSION') ? PHPBB_VERSION : '0.0.0';
    }

    /**
     * @return string
     */
    public function getCachePath()
    {
        return rtrim(Runtime::rootPath(), '/\\') . '/cache/gantry5';
    }

    /**
     * @return array
     */
    public function getThemesPaths()
    {
        return ['' => [$this->relativeExtensionPath() . '/themes']];
    }

    /**
     * @return array
     */
    public function getMediaPaths()
    {
        return ['' => ['gantry-theme://images']];
    }

    /**
     * @return array
     */
    public function getEnginesPaths()
    {
        $extPath = $this->relativeExtensionPath();

        return ['' => ["{$extPath}/engines/phpbb", "{$extPath}/engines/common"]];
    }

    /**
     * The locator (UniformResourceLocator) is rooted at GENESIS_ROOT (the phpBB installation
     * root), and needs paths relative to it -- not absolute filesystem paths -- for any resource
     * that must resolve to a public URL (engines, themes, assets). Only getCachePath() (which is
     * always resolved with $absolute = true) can safely return an absolute path.
     *
     * @return string
     */
    protected function relativeExtensionPath()
    {
        $root = rtrim(Runtime::rootPath(), '/\\');
        $ext = rtrim(Runtime::extensionPath(), '/\\');

        if (strpos($ext, $root) === 0) {
            return ltrim(substr($ext, \strlen($root)), '/\\');
        }

        return $ext;
    }

    /**
     * @return array
     */
    public function getAssetsPaths()
    {
        return ['' => ['gantry-theme://', $this->relativeExtensionPath() . '/assets']];
    }

    /**
     * @param string $position
     * @return int
     */
    public function countModules($position)
    {
        return \count($this->getModules($position));
    }

    /**
     * @param string $position
     * @return array
     */
    public function getModules($position)
    {
        return (new Position($position))->listModules();
    }

    /**
     * @param string|array $id
     * @param array $attribs
     * @return string
     */
    public function displayModule($id, $attribs = [])
    {
        $module = \is_array($id) ? $id : $this->getModule($id);

        if (!$module || !\is_array($module)) {
            return '';
        }

        if (isset($module['assignments'])) {
            $assignments = $module['assignments'];
            $outline = Gantry::instance()['configuration'];

            if (\is_array($assignments) && !\in_array($outline, ['_error', '_offline'], true)) {
                $matches = (new Assignments())->matches(['test' => $assignments]);
                if (\GANTRY_DEBUGGER) {
                    Debugger::addMessage("Module assignments for '{$module['id']}' (rules, matches):", 'debug');
                    Debugger::addMessage($assignments, 'debug');
                    Debugger::addMessage(isset($matches['test']) ? $matches['test'] : [], 'debug');
                }
                if (!$matches) {
                    return '';
                }
            } elseif ($assignments !== 'all') {
                return '';
            }
        }

        /** @var Theme $theme */
        $theme = $this->container['theme'];

        if (isset($attribs['ajax']) && \is_array($attribs['ajax'])) {
            $attribs['style'] = 'none';
        }

        return trim($theme->render('@nucleus/partials/module.html.twig', $attribs + ['inContent' => true, 'segment' => $module]));
    }

    /**
     * @param string $position
     * @param array $attribs
     * @return string
     */
    public function displayModules($position, $attribs = [])
    {
        $html = '';
        foreach ($this->getModules($position) as $module) {
            $html .= $this->displayModule($module, $attribs + ['position' => $position]);
        }

        return $html;
    }

    /**
     * @param string $id
     * @return array
     */
    protected function getModule($id)
    {
        [$position, $module] = explode('/', $id, 2);

        return (new Module($module, $position))->toArray();
    }

    /**
     * Get preview url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    public function getThemePreviewUrl($theme)
    {
        return null;
    }

    /**
     * Get administrator url for individual theme.
     *
     * @param string $theme
     * @return string|null
     */
    public function getThemeAdminUrl($theme)
    {
        return $this->settings();
    }

    /**
     * @return string
     */
    public function settings()
    {
        if (!$this->authorize('platform.settings.manage')) {
            return '';
        }

        /** @var \phpbb\path_helper $pathHelper */
        $pathHelper = Runtime::service('path_helper');

        return $pathHelper->get_web_root_path() . 'adm/index.' . Runtime::phpExt() . '?i=gantry5&mode=main';
    }

    /**
     * @param string $action
     * @param int|string|null $id
     * @return bool
     */
    public function authorize($action, $id = null)
    {
        static $actions = [
            'platform.settings.manage' => 'a_board',
            'updates.manage' => 'a_board',
            'menu.manage' => 'a_board',
            'menu.edit' => 'a_board',
            'outline.create' => 'a_board',
            'outline.rename' => 'a_board',
            'outline.delete' => 'a_board',
            'outline.assign' => 'a_board',
        ];

        if (isset($actions[$action])) {
            /** @var \phpbb\auth\auth $auth */
            $auth = Runtime::service('auth');

            return (bool) $auth->acl_get($actions[$action]);
        }

        return true;
    }
}
