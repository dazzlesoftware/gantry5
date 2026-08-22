<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html\Configurations;

use Genesis\Admin\Events\PageEvent;
use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Config\BlueprintSchema;
use Genesis\Component\Config\Config;
use Genesis\Component\Layout\Layout;
use Genesis\Component\Response\JsonResponse;
use Genesis\Framework\Atoms;
use Genesis\Framework\Services\ConfigServiceProvider;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Page
 * @package Genesis\Admin\Controller\Html\Configurations
 */
class Page extends HtmlController
{
    /** @var array */
    protected array $httpVerbs = [
        'GET'    => [
            '/' => 'index'
        ],
        'POST'   => [
            '/'                 => 'save',
            '/*'                => 'save',
            '/*/**'             => 'formfield',
            '/atoms'            => 'undefined',
            '/atoms/*'          => 'atom',
            '/atoms/*/validate' => 'atomValidate'
        ],
        'PUT'    => [
            '/' => 'save'
        ],
        'PATCH'  => [
            '/' => 'save'
        ],
        'DELETE' => [
            '/' => 'forbidden'
        ]
    ];

    /**
     * @return string
     */
    public function index(): string
    {
        $outline = (string) $this->params['outline'];

        if ($outline === 'default') {
            $this->params['overrideable'] = false;
            $data = $this->container['config'];
        } else {
            $this->params['overrideable'] = true;
            $this->params['defaults'] = $defaults = $this->container['defaults'];
            $data = ConfigServiceProvider::load($this->container, $outline, false, false);
        }

        $deprecated = $this->getDeprecatedAtoms();
        if ($deprecated) {
            $data->set('page.head.atoms', $deprecated);
        }

        if (isset($defaults)) {
            $currentAtoms = $data->get('page.head.atoms');
            if (!$currentAtoms) {
                // Make atoms to appear to be inherited in they are loaded from defaults.
                $defaultAtoms = (array) $defaults->get('page.head.atoms');
                $atoms = (new Atoms($defaultAtoms))->inheritAll('default')->toArray();
                $defaults->set('page.head.atoms', $atoms);
            }
        }

        $this->params += [
            'data' => $data,
            'page' => $this->container['page']->group(),
            'route'  => "configurations.{$outline}",
            'page_id' => $outline,
            'atoms' => $this->getAtoms(),
            'atoms_deprecated' => $deprecated
        ];

        return $this->render('@genesis-admin/pages/configurations/page/page.html.twig', $this->params);
    }

    /**
     * @param string|null $id
     * @return string
     */
    public function save(?string $id = null): string
    {
        $data = $id ? [$id => $this->request->post->getArray()] : $this->request->post->getArray('page');

        foreach ($data as $name => $values) {
            $this->saveItem($name, $values);
        }

        // Fire save event.
        $event             = new PageEvent();
        $event->genesis     = $this->container;
        $event->theme      = $this->container['theme'];
        $event->controller = $this;
        $event->data       = $data;
        $this->container->fireEvent('admin.page.save', $event);

        return $id ? $this->display($id) : $this->index();
    }

    /**
     * @param string $id
     * @return string
     */
    public function formfield(string $id, string ...$pathParts): JsonResponse|string
    {
        $path = [$id, ...$pathParts];

        $end = end($path);
        if ($end === '') {
            array_pop($path);
        }
        if (end($path) === 'validate') {
            return call_user_func_array([$this, 'validate'], $path);
        }

        // Load blueprints.
        $blueprints = $this->container['page']->getBlueprintForm($id);

        list($fields, $path, $value) = $blueprints->resolve(array_slice($path, 1), '/');

        if (!$fields) {
            throw new \RuntimeException('Page Not Found', 404);
        }

        $data = $this->request->post->getJsonArray('data');

        $offset = "page.{$id}." . implode('.', $path);
        if ($value !== null) {
            $parent = $fields;
            $fields = ['fields' => $fields['fields']];
            $offset .= '.' . $value;
            $data = $data ?: $this->container['config']->get($offset);
            $data = ['data' => $data];
            $scope = 'data.';
        } else {
            $data = $data ?: $this->container['config']->get($offset);
            $scope = 'data';
        }

        $fields['is_current'] = true;

        array_pop($path);

        $outline = (string) $this->params['outline'];
        $configuration = "configurations/{$outline}";
        $this->params = [
                'configuration' => $configuration,
                'blueprints' => $fields,
                'data' => $data,
                'prefix' => '',
                'scope' => $scope,
                'parent' => $path
                    ? "$configuration/settings/particles/{$id}/" . implode('/', $path)
                    : "$configuration/settings/particles/{$id}",
                'route' => "configurations.{$outline}.{$offset}",
            ] + $this->params;

        if (isset($parent['key'])) {
            $this->params['key'] = $parent['key'];
        }
        if (isset($parent['value'])) {
            $this->params['title'] = $parent['value'];
        }

        return $this->render('@genesis-admin/pages/configurations/settings/field.html.twig', $this->params);
    }

    /**
     * @param string $particle
     * @return JsonResponse
     */
    public function validate(string $particle, string ...$pathParts): JsonResponse
    {
        $path = implode('.', array_slice($pathParts, 0, -1));

        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        // Load particle blueprints.
        $validator = $this->container['particles']->get($particle);

        // Create configuration from the defaults.
        $data = new Config(
            [],
            static function () use ($validator): mixed {
                return $validator;
            }
        );

        $data->join($path, $this->request->post->getArray('data'));

        // TODO: validate

        return new JsonResponse(['data' => $data->get($path)]);
    }

    /**
     * @param string $name
     * @return JsonResponse
     */
    public function atom(string $name): JsonResponse
    {
        $outline = (string) $this->params['outline'];
        $atoms = Atoms::instance($outline);

        $data = $this->request->post['data'];
        if ($data) {
            $data = json_decode((string) $data, true);
        } else {
            $data = $this->request->post->getArray();
        }

        // Create atom and get its blueprint.
        $item = $atoms->createAtom($name, is_array($data) ? $data : []);
        $blueprint = $item->blueprint();

        // Load inheritance blueprint.
        $inheritance = $atoms->getInheritanceBlueprint($name, $item->get('id'));
        $inheritable = $inheritance && $inheritance->get('form/fields/outline/filter', []);

        $this->params += [
            'inherit'       => null, //!empty($inherit['outline']) ? $inherit['outline'] : null,
            'inheritance'   => $inheritance,
            'inheritable'   => $inheritable,
            'item'          => $item,
            'data'          => ['particles' => [$name => $item->get('attributes')]],
            'blueprints'    => $blueprint,
            'parent'        => 'settings',
            'prefix'        => "particles.{$name}.",
            'route'         => "configurations.default.settings",
            'action'        => "configurations/{$outline}/page/atoms/{$name}/validate",
            'skip'          => ['enabled']
        ];

        return new JsonResponse(['html' => $this->render('@genesis-admin/modals/atom.html.twig', $this->params)]);
    }

    /**
     * Validate data for the atom.
     *
     * @param string $name
     * @return JsonResponse
     */
    public function atomValidate(string $name): JsonResponse
    {
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

        $data->set('id', $this->request->post['id']);
        $data->set('type', $name);
        $data->set('title', $this->request->post['title'] ?: $blueprints->get('name'));
        $data->set('attributes', $this->request->post->getArray("particles.{$name}"));
        $data->def('attributes.enabled', 1);

        $block = $this->request->post->getArray('block');
        foreach ($block as $key => $param) {
            if ($param === '') {
                unset($block[$key]);
            }
        }

        $inherit = $this->request->post->getArray('inherit');
        $clone = !empty($inherit['mode']) && $inherit['mode'] === 'clone';
        $inherit['include'] = !empty($inherit['include']) ? explode(',', $inherit['include']) : [];
        if (!$clone && !empty($inherit['outline']) && count($inherit['include'])) {
            unset($inherit['mode']);
            $data->join('inherit', $inherit);
        }

        // TODO: validate

        // Fill parameters to be passed to the template file.
        $this->params['item'] = (object) $data->toArray();

        return new JsonResponse(['item' => $data->toArray()]);
    }

    /**
     * @param string $id
     * @param array $data
     */
    protected function saveItem(string $id, mixed $data): void
    {
        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        // Save layout into custom directory for the current theme.
        $outline = (string) $this->params['outline'];

        // Move atoms out of layout.
        if ($id === 'head') {
            $layout = Layout::instance($outline);
            if (is_array($layout->atoms())) {
                $layout->save(false);
            }
            if (isset($data['atoms'])) {
                $atoms = new Atoms($data['atoms']);
                $data['atoms'] = $atoms->update()->toArray();
            }
        }

        $save_dir      = $locator->findResource("genesis-config://{$outline}/page", true, true);
        if (!is_string($save_dir) || $save_dir === '') {
            throw new \RuntimeException('Unable to create the page configuration folder', 500);
        }
        $filename      = "{$save_dir}/{$id}.yaml";

        $file = YamlFile::instance($filename);
        if (!is_array($data)) {
            if ($file->exists()) {
                $file->delete();
            }
        } else {
            $blueprints = $this->container['page']->getBlueprintForm($id);
            $config     = new Config($data, static function () use ($blueprints): mixed { return $blueprints; });

            $file->save($config->toArray());
        }
        $file->free();
    }

    /**
     * @return array|null
     */
    protected function getDeprecatedAtoms(): ?array
    {
        $id     = (string) $this->params['outline'];
        $layout = Layout::instance($id);

        return $layout->atoms();
    }

    /**
     * @param bool $onlyEnabled
     * @return array
     */
    protected function getAtoms(bool $onlyEnabled = false): array
    {
        $config = $this->container['config'];

        $atoms = $this->container['particles']->all();

        $list = [];
        foreach ($atoms as $name => $atom) {
            $type     = isset($atom['type']) ? $atom['type'] : 'atom';
            $atomName = isset($atom['name']) ? $atom['name'] : $name;

            if (!$onlyEnabled || $config->get("particles.{$name}.enabled", true)) {
                $list[$type][$name] = $atomName;
            }
        }

        return $list['atom'] ?? [];
    }
}
