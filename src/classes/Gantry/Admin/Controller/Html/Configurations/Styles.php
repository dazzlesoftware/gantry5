<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin\Controller\Html\Configurations;

use Gantry\Admin\Events\StylesEvent;
use Gantry\Component\Admin\HtmlController;
use Gantry\Component\Config\Config;
use Gantry\Component\Response\JsonResponse;
use Gantry\Framework\Services\ConfigServiceProvider;
use Gantry\Framework\Theme;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Styles
 * @package Gantry\Admin\Controller\Html\Configurations
 */
class Styles extends HtmlController
{

    protected $httpVerbs = [
        'GET' => [
            '/'              => 'index',
            '/blocks'        => 'undefined',
            '/blocks/*'      => 'display',
            '/blocks/*/**'   => 'formfield'
        ],
        'POST' => [
            '/'          => 'save',
            '/blocks'    => 'forbidden',
            '/blocks/*'  => 'save',
            '/compile'   => 'compile'
        ],
        'PUT' => [
            '/'         => 'save',
            '/blocks'   => 'forbidden',
            '/blocks/*' => 'save'
        ],
        'PATCH' => [
            '/'         => 'save',
            '/blocks'   => 'forbidden',
            '/blocks/*' => 'save'
        ],
        'DELETE' => [
            '/'         => 'forbidden',
            '/blocks'   => 'forbidden',
            '/blocks/*' => 'reset'
        ]
    ];

    /**
     * @return string
     */
    public function index()
    {
        $outline = $this->params['outline'];

        if($outline === 'default') {
            $this->params['overrideable'] = false;
            $this->params['data'] = $this->container['config'];
        } else {
            $this->params['overrideable'] = true;
            $this->params['defaults'] = $this->container['defaults'];
            $this->params['data'] = ConfigServiceProvider::load($this->container, $outline, false, false);
        }

        $this->params['blocks'] = $this->container['styles']->group();
        $this->params['route']  = "configurations.{$outline}.styles";

        return $this->render('@gantry-admin/pages/configurations/styles/styles.html.twig', $this->params);
    }

    /**
     * @param string $id
     * @return string
     */
    public function display($id)
    {
        $outline = $this->params['outline'];
        $blueprints = $this->container['styles']->getBlueprintForm($id);
        $prefix = 'styles.' . $id;

        if($outline === 'default') {
            $this->params['overrideable'] = false;
            $this->params['data'] = $this->container['config']->get($prefix);
        } else {
            $this->params['overrideable'] = true;
            $this->params['defaults'] = $this->container['defaults']->get($prefix);
            $this->params['data'] = ConfigServiceProvider::load($this->container, $outline, false, false)->get($prefix);
        }

        $this->params += [
            'block' => $blueprints,
            'id' => $id,
            'parent' => "configurations/{$outline}/styles",
            'route'  => "configurations.{$outline}.styles.{$prefix}",
            'skip' => ['enabled']
        ];

        return $this->render('@gantry-admin/pages/configurations/styles/item.html.twig', $this->params);
    }

    /**
     * @param string $id
     * @return string
     */
    public function formfield($id)
    {
        $path = func_get_args();

        $outline = $this->params['outline'];

        // Load blueprints.
        $blueprints = $this->container['styles']->getBlueprintForm($id);

        list($fields, $path, $value) = $blueprints->resolve(array_slice($path, 1), '/');

        if (!$fields) {
            throw new \RuntimeException('Page Not Found', 404);
        }

        $fields['is_current'] = true;

        // Get the prefix.
        $prefix = "styles.{$id}." . implode('.', $path);
        if ($value !== null) {
            $parent = $fields;
            $fields = ['fields' => $fields['fields']];
            $prefix .= '.' . $value;
        }
        array_pop($path);

        if($outline === 'default') {
            $this->params['overrideable'] = false;
            $this->params['data'] = $this->container['config']->get($prefix);
        } else {
            $this->params['overrideable'] = true;
            $this->params['defaults'] = $this->container['defaults']->get($prefix);
            $this->params['data'] = ConfigServiceProvider::load($this->container, $outline, false, false)->get($prefix);
        }

        $this->params = [
                'blueprints' => $fields,
                'parent' => $path
                    ? "configurations/{$outline}/styles/blocks/{$id}/" . implode('/', $path)
                    : "configurations/{$outline}/styles/blocks/{$id}",
                'route' => 'styles.' . $prefix
            ] + $this->params;

        if (isset($parent['key'])) {
            $this->params['key'] = $parent['key'];
        }

        return $this->render('@gantry-admin/pages/configurations/styles/field.html.twig', $this->params);
    }

    /**
     * @param string $id
     * @return string
     */
    public function reset($id)
    {
        $this->params += [
            'data' => [],
        ];

        return $this->display($id);
    }

    /**
     * @return JsonResponse
     */
    public function compile()
    {
        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        $warnings = $this->compileSettings();

        if ($warnings) {
            $title = isset($warnings['__TITLE__']) ? $warnings['__TITLE__'] : 'CSS Compiled With Warnings';
            unset($warnings['__TITLE__']);
            $this->params += ['warnings' => $warnings];
            return new JsonResponse(
                [
                    'html'    => $this->render('@gantry-admin/layouts/css-warnings.html.twig', $this->params),
                    'warning' => true,
                    'title'   => $title,
                ]
            );
        }

        return new JsonResponse(['html' => 'The CSS was successfully compiled', 'title' => 'CSS Compiled']);
    }

    /**
     * @param string|null $id
     * @return JsonResponse|string
     */
    public function save($id = null)
    {
        /** @var Config $config */
        $config = $this->container['config'];

        if ($id) {
            $data = (array) $config->get('styles');
            $data[$id] = $this->request->post->getArray();
        } else {
            $data = $this->request->post->getArray('styles');
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        // Save layout into custom directory for the current theme.
        $outline = $this->params['outline'];
        $save_dir = $locator->findResource("gantry-config://{$outline}", true, true);
        $filename = "{$save_dir}/styles.yaml";

        $file = YamlFile::instance($filename);
        $file->save($data);
        $file->free();

        // Fire save event.
        $event = new StylesEvent();
        $event->gantry = $this->container;
        $event->theme = $this->container['theme'];
        $event->controller = $this;
        $event->data = $data;
        $this->container->fireEvent('admin.styles.save', $event);

        // Compile CSS.
        $warnings = $this->compileSettings();

        if (empty($this->params['ajax'])) {
            // FIXME: HTML request: Output compiler warnings!!
            return $id ? $this->display($id) : $this->index();
        }

        if ($warnings) {
            $this->params += ['warnings' => $warnings];
            return new JsonResponse(
                [
                    'html'    => $this->render('@gantry-admin/layouts/css-warnings.html.twig', $this->params),
                    'warning' => true,
                    'title'   => 'CSS Compiled With Warnings',
                ]
            );
        }

        return new JsonResponse(['html' => 'The CSS was successfully compiled', 'title' => 'CSS Compiled']);
    }

    /**
     * @returns array
     */
    protected function compileSettings()
    {
        /** @var Theme $theme */
        $theme = $this->container['theme'];
        $outline = $this->params['outline'];

        if ($outline !== 'default') {
            return $theme->updateCss([$outline => ucfirst($outline)]);
        }

        // Default style changes affect every outline. Compile the active default
        // files immediately, then invalidate derived files so Gantry recompiles
        // each one on demand instead of blocking this request on every outline.
        $warnings = $theme->updateCss(['default' => 'Default']);
        $this->invalidateDerivedCss($theme);

        return $warnings;
    }

    /**
     * Remove compiled files for outlines which inherit from Default.
     *
     * @param Theme $theme
     * @return void
     */
    protected function invalidateDerivedCss(Theme $theme)
    {
        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];
        $outlines = (array) $this->container['outlines'];
        $files = (array) $theme->details()->get('configuration.css.files');
        $compiler = $theme->compiler();

        unset($outlines['default']);

        foreach (array_keys($outlines) as $outline) {
            $compiler->reset()->setConfiguration($outline);

            foreach ($files as $file) {
                $path = $locator->findResource($compiler->getCssUrl($file));
                if (!$path || !is_file($path)) {
                    continue;
                }

                $map = $path . '.map';
                if (is_file($map)) {
                    @unlink($map);
                }
                @unlink($path);
            }
        }

        clearstatcache();
    }
}
