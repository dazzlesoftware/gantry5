<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html;

use Genesis\Admin\Events\MenuEvent;
use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Config\BlueprintSchema;
use Genesis\Component\Config\BlueprintForm;
use Genesis\Component\Config\Config;
use Genesis\Component\Menu\AbstractMenu;
use Genesis\Component\Menu\Item;
use Genesis\Component\Request\Input;
use Genesis\Component\Response\HtmlResponse;
use Genesis\Component\Response\JsonResponse;
use Genesis\Component\Response\Response;
use Genesis\Framework\Menu as MenuObject;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Menu
 * @package Genesis\Admin\Controller\Html
 */
class Menu extends HtmlController
{
    protected array $httpVerbs = [
        'GET'    => [
            '/'                  => 'item',
            '/*'                 => 'item',
            '/*/**'              => 'item',
            '/particle'          => 'particle',
            '/particle/*'        => 'validateParticle',
            '/select'            => 'undefined',
            '/select/particle'   => 'selectParticle',
            '/select/module'     => 'selectModule',
            '/select/widget'     => 'selectWidget',
            '/edit'              => 'undefined',
            '/edit/*'            => 'edit',
            '/edit/*/**'         => 'editItem',
        ],
        'POST'   => [
            '/'                  => 'save',
            '/*'                 => 'save',
            '/*/**'              => 'item',
            '/particle'          => 'particle',
            '/particle/*'        => 'validateParticle',
            '/select'            => 'undefined',
            '/select/particle'   => 'selectParticle',
            '/select/module'     => 'selectModule',
            '/select/widget'     => 'selectWidget',
            '/widget'            => 'widget',
            '/edit'              => 'undefined',
            '/edit/*'            => 'edit',
            '/edit/*/**'         => 'editItem',
            '/edit/*/validate'   => 'validate',
        ],
        'PUT'    => [
            '/*' => 'replace'
        ],
        'PATCH'  => [
            '/*' => 'update'
        ],
        'DELETE' => [
            '/*' => 'destroy'
        ]
    ];

    /**
     * @param string|null $id
     * @param string ...$parts
     * @return string
     */
    public function item(?string $id = null, string ...$parts): string
    {
        // All extra arguments become the path.
        $path = $parts ? implode('/', $parts) : '';

        // Load the menu.
        try {
            $resource = $this->loadResource($id, $this->build($this->request->post));
        } catch (\Exception $e) {
            $this->params['error'] = $e;
            $this->params['id'] = $id;
            $this->params['menus'] = $this->getMenuOptions();
            $this->params['path'] = $path;

            return $this->render('@genesis-admin/pages/menu/menu.html.twig', $this->params);
        }

        // Get menu item and make sure it exists.
        $item = $resource->get($path);
        if (!$item) {
            throw new \RuntimeException('Menu item not found.', 404);
        }

        // Fill parameters to be passed to the template file.
        $this->params['id'] = $resource->name();
        $this->params['menus'] = $resource->getMenuOptions();
        $this->params['default_menu'] = $resource->hasDefaultMenu() ? $resource->getDefaultMenuName() : false;
        $this->params['menu'] = $resource;
        $this->params['path'] = $path;

        // Detect special case to fetch only single column group.
        $group = $this->request->get['group'];
        $level = count($parts);
        if (null !== $group) {
            $group = (int)$group;
            $level++;
        } else {
            $group = (int)$resource->get(implode('/', array_slice($parts, 0, 2)))->group;
        }

        if (empty($this->params['ajax']) || empty($this->request->get['inline'])) {
            // Handle special case to fetch only one column group.
            if (count($parts) > 0) {
                $this->params['columns'] = $resource->get($parts[0]);
            }
            if (count($parts) > 1) {
                $this->params['column'] = $group;
                $this->params['override'] = $item;
            }

            return $this->render('@genesis-admin/pages/menu/menu.html.twig', $this->params);

        }

        // Get layout name.
        $layout = $this->layoutName($level);

        $this->params['item'] = $item;
        $this->params['group'] = $group;

        return $this->render('@genesis-admin/menu/' . $layout . '.html.twig', $this->params) ?: '&nbsp;';
    }

    /**
     * @param string $id
     * @return string
     */
    public function edit(mixed $id): string
    {
        $resource = $this->loadResource((string) $id);
        if (!$this->authorize('menu.manage', $resource->name())) {
            $this->forbidden();
        }

        $input = $this->build($this->request->post);
        if ($input) {
            $resource->config()->merge(['settings' => $input['settings']]);
        }

        // Fill parameters to be passed to the template file.
        $this->params['id'] = $resource->name();
        $this->params['blueprints'] = $this->loadBlueprints();
        $this->params['data'] = ['settings' => $resource->settings()];

        return $this->render('@genesis-admin/pages/menu/edit.html.twig', $this->params);
    }

    /**
     * @param string|null $id
     */
    public function save(?string $id = null): JsonResponse
    {
        $resource = $this->loadResource($id);
        if (!$this->authorize('menu.manage', $resource->name()) && !$this->authorize('menu.edit', $resource->name())) {
            $this->forbidden();
        }

        $data = $this->build($this->request->post);

        // Fire save event.
        $event = new MenuEvent();
        $event->genesis = $this->container;
        $event->theme = $this->container['theme'];
        $event->controller = $this;
        $event->resource = $id ?? $resource->name();
        $event->menu = $data;
        $this->container->fireEvent('admin.menus.save', $event);

        if ($event->delete) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $filename = $locator->findResource("genesis-config://menu/{$resource->name()}.yaml", true, true);
            if (!is_string($filename) || $filename === '') {
                throw new \RuntimeException('Unable to resolve the menu configuration file', 500);
            }

            $file = YamlFile::instance($filename);
            $file->delete();
            $file->free();

        } elseif ($event->save) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];
            $filename = $locator->findResource("genesis-config://menu/{$resource->name()}.yaml", true, true);
            if (!is_string($filename) || $filename === '') {
                throw new \RuntimeException('Unable to resolve the menu configuration file', 500);
            }

            $file = YamlFile::instance($filename);
            $file->settings(['inline' => 99]);
            $file->save($data->toArray());
            $file->free();
        }

        $response = ['code' => 200, 'success' => true, 'html' => ''];
        $production = $this->container['global']->get('production');
        if (!$production && $event->debug) {
            $response['debug'] = $event->debug;
        }

        return new JsonResponse($response);
    }

    /**
     * @param string $id
     * @return string
     */
    public function editItem(string $id, string ...$pathParts): JsonResponse|string
    {
        // All extra arguments become the path.
        $path = $pathParts;
        $keyword = end($path);

        // Special case: validate instead of fetching menu item.
        if ($this->method === 'POST' && $keyword === 'validate') {
            $params = [$id, ...array_slice($pathParts, 0, -1)];
            return call_user_func_array([$this, 'validateitem'], $params);
        }

        $path = html_entity_decode(implode('/', $path), ENT_COMPAT | ENT_HTML5, 'UTF-8');

        // Load the menu.
        $resource = $this->loadResource($id);
        if (!$this->authorize('menu.manage', $resource->name())) {
            $this->forbidden();
        }

        // Get menu item and make sure it exists.
        /** @var Item|null $item */
        $item = $resource->get($path);
        if (!$item) {
            throw new \RuntimeException('Menu item not found', 404);
        }
        $data = $this->request->post->getJsonArray('item');
        if ($data) {
            $item->update($data);
        }

        // Load blueprints for the menu item.
        $blueprints = $this->loadBlueprints('menuitem');

        $this->params = [
                'id'         => $resource->name(),
                'path'       => $path,
                'blueprints' => ['fields' => $blueprints['form/fields/items/fields']],
                'data'       => $item->toArray() + ['path' => $path],
                'item'       => $item,
            ] + $this->params;

        return $this->render('@genesis-admin/pages/menu/menuitem.html.twig', $this->params);
    }

    /**
     * @return string
     */
    public function particle(): string
    {
        $data = $this->request->post['item'];
        if ($data) {
            $decoded = json_decode((string) $data, true);
            $data = is_array($decoded) ? $decoded : [];
        } else {
            $data = $this->request->post->getArray();
        }

        $name = isset($data['particle']) ? $data['particle'] : null;
        if (!is_string($name) || $name === '') {
            throw new \RuntimeException('Particle type was not provided', 400);
        }

        $block = BlueprintForm::instance('menu/block.yaml', 'genesis-admin://blueprints');
        $blueprints = $this->container['particles']->getBlueprintForm($name);

        // Load particle blueprints and default settings.
        $validator = $this->loadBlueprints('menu');
        $callable = static function () use ($validator): BlueprintForm {
            return $validator;
        };

        // Create configuration from the defaults.
        $item = new Config($data, $callable);
        $item->def('type', 'particle');
        $item->def('title', $blueprints->get('name'));
        $item->def('options.type', $blueprints->get('type', 'particle'));
        $item->def('options.particle', []);
        $item->def('options.block', []);

        $this->params += [
            'item'          => $item,
            'block'         => $block,
            'data'          => ['particles' => [$name => $item->options['particle']]],
            'particle'      => $blueprints,
            'parent'        => 'settings',
            'prefix'        => "particles.{$name}.",
            'route'         => "configurations.default.settings",
            'action'        => "menu/particle/{$name}"
        ];

        return $this->render('@genesis-admin/pages/menu/particle.html.twig', $this->params);
    }

    /**
     * @param string $name
     * @return JsonResponse
     */
    public function validateParticle(string $name): JsonResponse
    {
        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        // Load particle blueprints and default settings.
        $validator = new BlueprintSchema;
        $validator->embed('options', $this->container['particles']->get($name));

        $blueprints = $this->container['particles']->getBlueprintForm($name);

        // Create configuration from the defaults.
        $data = new Config([],
            static function () use ($validator): BlueprintSchema {
                return $validator;
            }
        );

        if (!empty($this->request->post['id'])) {
            $data->set('id', $this->request->post['id']);
        }
        $data->set('type', 'particle');
        $data->set('particle', $name);
        $data->set('title', $this->request->post['title'] ?: $blueprints->post['name']);
        $data->set('options.particle', $this->request->post->getArray("particles.{$name}"));
        $data->def('options.particle.enabled', 1);
        $data->set('enabled', $data->get('options.particle.enabled'));

        $block = $this->request->post->getArray('block');
        foreach ($block as $key => $param) {
            if ($param === '') {
                unset($block[$key]);
            }
        }

        $data->join('options.block', $block);

        // TODO: validate

        // Fill parameters to be passed to the template file.
        $this->params['item'] = (object) $data->toArray();

        $html = $this->render('@genesis-admin/menu/item.html.twig', $this->params);

        return new JsonResponse(['item' => $data->toArray(), 'html' => $html]);
    }

    /**
     * @return string
     */
    public function selectModule(): string
    {
        return $this->render('@genesis-admin/modals/module-picker.html.twig', $this->params);
    }

    /**
     * @return string
     */
    public function selectWidget(): string
    {
        $this->params['next'] = 'menu/widget';

        return $this->render('@genesis-admin/modals/widget-picker.html.twig', $this->params);
    }

    /**
     * @return HtmlResponse|Response
     */
    public function widget(): Response
    {
        $data = $this->request->post->getJson('item');
        if (!is_object($data) || !isset($data->widget)) {
            throw new \RuntimeException('Widget was not provided', 400);
        }
        $path = [$data->widget];
        $this->params['scope'] = 'menu';

        return $this->executeForward('widget', 'POST', $path, $this->params);
    }

    /**
     * @return string
     */
    public function selectParticle(): string
    {
        $groups = [];
        foreach ($this->container['particles']->categories() as $category) {
            $groups[$category] = ['particle' => []];
        }

        $particles = [
            'position'    => [],
            'spacer'      => [],
            'system'      => [],
            'particle'    => [],
        ];

        $particles = array_replace($particles, $this->getParticles());
        unset($particles['atom'], $particles['position']);

        foreach ($particles as &$group) {
            asort($group);
        }
        unset($group);

        foreach ($particles['particle'] as $name => $particle) {
            $groups[$particle['_genesis_category']]['particle'][$name] = $particle;
        }

        $this->params += [
            'particles' => $groups,
            'route' => 'menu/particle',
        ];

        return $this->render('@genesis-admin/modals/particle-picker.html.twig', $this->params);
    }

    /**
     * @param string $id
     * @return JsonResponse
     */
    public function validate(string $id): JsonResponse
    {
        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        // Load particle blueprints and default settings.
        $validator = $this->loadBlueprints('menu');
        $callable = static function () use ($validator): BlueprintForm {
            return $validator;
        };

        // Create configuration from the defaults.
        $data = new Config($this->request->post->getArray(), $callable);

        // TODO: validate

        return new JsonResponse(['settings' => (array) $data->get('settings')]);
    }

    /**
     * @param string $id
     * @return JsonResponse
     */
    public function validateitem(string $id, string ...$path): JsonResponse
    {
        // All extra arguments become the path.
        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        // Load the menu.
        $resource = $this->loadResource($id);

        // Load particle blueprints and default settings.
        $validator = $this->loadBlueprints('menuitem');
        $callable = static function () use ($validator): BlueprintForm {
            return $validator;
        };

        // Create configuration from the defaults.
        $data = new Config($this->request->post->getArray(), $callable);

        // TODO: validate

        $item = $resource->get(implode('/', $path));
        if (!$item) {
            throw new \RuntimeException('Menu item not found', 404);
        }
        $item->update($data->toArray());
        $group = $resource->get(implode('/', array_slice($path, 0, 2)))->group;

        // Fill parameters to be passed to the template file.
        $this->params['id'] = $resource->name();
        $this->params['item'] = $item;
        $this->params['group'] = $group;

        if (!$item->title) {
            throw new \RuntimeException('Title from the Menu Item should not be empty', 400);
        }

        $html = $this->render('@genesis-admin/menu/item.html.twig', $this->params);

        return new JsonResponse(['path' => implode('/', $path), 'item' => $data->toArray(), 'html' => $html]);
    }

    /**
     * @param int $level
     * @return string
     */
    protected function layoutName(int $level): string
    {
        switch ($level) {
            case 0:
                return 'base';
            case 1:
                return 'columns';
            default:
                return 'list';
        }
    }

    /**
     * Load resource.
     *
     * @param string $id
     * @param Config $config
     * @return AbstractMenu
     * @throws \RuntimeException
     */
    protected function loadResource(mixed $id, ?Config $config = null): AbstractMenu
    {
        /** @var MenuObject $menus */
        $menus = $this->container['menu'];

        return $menus->instance(['menu' => $id !== null ? (string) $id : null, 'admin' => true, 'POST' => $config !== null], $config);
    }

    /**
     * @return string[]
     */
    protected function getMenuOptions(): array
    {
        /** @var MenuObject $menus */
        $menus = $this->container['menu'];

        return $menus->getMenuOptions();
    }

    /**
     * Load blueprints.
     *
     * @param string $name
     * @return BlueprintForm
     */
    protected function loadBlueprints(string $name = 'menu'): BlueprintForm
    {
        return BlueprintForm::instance("menu/{$name}.yaml", 'genesis-admin://blueprints');
    }

    /**
     * @param Input $input
     * @return Config|null
     */
    public function build(Input $input): ?Config
    {
        try {
            $items = $input->get('items');
            $items = is_scalar($items) ? (string) $items : '';
            if ($items && $items[0] !== '{' && $items[0] !== '[') {
                $items = urldecode((string)base64_decode($items));
            }
            $items = json_decode((string)$items, true);

            $settings = $input->getJsonArray('settings');
            $order = $input->getJsonArray('ordering');
        } catch (\Exception $e) {
            throw new \RuntimeException('Invalid menu structure', 400);
        }

        if (!$items && !$settings && !$order) {
            return null;
        }


        krsort($order);
        $ordering = ['' => []];
        foreach ($order as $path => $columns) {
            foreach ($columns as $column => $colitems) {
                $list = [];
                foreach ($colitems as $item) {
                    $name = trim(substr($item, strlen($path)), '/');
                    if (isset($ordering[$item])) {
                        $list[$name] = $ordering[$item];
                        unset($ordering[$item]);
                    } else {
                        $list[$name] = '';
                    }
                }
                if (count($columns) > 1) {
                    $ordering[$path][$column] = $list;
                } else {
                    $ordering[$path] = $list;
                }
            }
        }

        $data = new Config([]);
        $data->set('settings', $settings);
        $data->set('ordering', $ordering['']);
        $data->set('items', $items);

        return $data;
    }

    /**
     * @return array
     */
    protected function getParticles(): array
    {
        $particles = $this->container['particles']->all();

        $list = [];
        foreach ($particles as $name => $particle) {
            $type = isset($particle['type']) ? $particle['type'] : 'particle';
            $particleName = isset($particle['name']) ? $particle['name'] : $name;
            $particleIcon = isset($particle['icon']) ? $particle['icon'] : null;
            $category = $this->container['particles']->category($name, $particle);
            $list[$type][$name] = [
                'name' => $particleName,
                'icon' => $particleIcon,
                '_genesis_source' => $this->container['particles']->isThemeParticle($name) ? 'theme' : null,
                '_genesis_category' => $category['label'],
                '_genesis_category_slug' => $category['slug']
            ];
        }

        return $list;
    }

    /**
     * @param string $resource
     * @param string $method
     * @param array $path
     * @param array $params
     * @return HtmlResponse|Response
     */
    protected function executeForward(string $resource, string $method = 'GET', array $path = [], array $params = []): Response
    {
        $class = '\\Genesis\\Admin\\Controller\\Json\\' . strtr(ucwords(strtr($resource, '/', ' ')), ' ', '\\');
        if (!class_exists($class)) {
            throw new \RuntimeException('Page not found', 404);
        }

        /** @var HtmlController $controller */
        $controller = new $class($this->container);

        // Execute action.
        $response = $controller->execute($method, $path, $params);

        if (!$response instanceof Response) {
            $response = new HtmlResponse($response);
        }

        return $response;
    }
}
