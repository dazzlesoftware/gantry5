<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html\Configurations;

use Genesis\Admin\Content as ContentConfig;
use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Config\Config;
use Genesis\Component\Response\JsonResponse;
use Genesis\Framework\Services\ConfigServiceProvider;
use Genesis\Component\Event\Event;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Content
 * @package Genesis\Admin\Controller\Html\Configurations
 */
class Content extends HtmlController
{
    protected array $httpVerbs = [
        'GET' => [
            '/'       => 'index',
            '/*'      => 'undefined',
            '/*/*'    => 'display',
            '/*/*/**' => 'formfield',
        ],
        'POST' => [
            '/'       => 'save',
            '/*'      => 'forbidden',
            '/*/*'    => 'save',
            '/*/*/**' => 'formfield'
        ],
        'PUT' => [
            '/'       => 'save',
            '/*'      => 'forbidden',
            '/*/*'    => 'save'
        ],
        'PATCH' => [
            '/'       => 'save',
            '/*'      => 'forbidden',
            '/*/*'    => 'save'
        ],
        'DELETE' => [
            '/'       => 'forbidden',
            '/*'      => 'forbidden',
            '/*/*'    => 'reset'
        ]
    ];

    /**
     * @return string
     */
    public function index(): string
    {
        /** @var ContentConfig $content */
        $content = $this->container['content'];

        $outline = $this->params['outline'];

        if($outline === 'default') {
            $this->params['overrideable'] = false;
            $data = $this->container['config'];
        } else {
            $this->params['defaults'] = $this->container['defaults'];
            $this->params['overrideable'] = true;
            $data = ConfigServiceProvider::load($this->container, $outline, false, false);
        }

        $this->params['data'] = $data;
        $this->params['content'] = $content->group();
        $this->params['route']  = "configurations.{$outline}.content";
        $this->params['page_id'] = $outline;

        return $this->render('@genesis-admin/pages/configurations/content/content.html.twig', $this->params);
    }

    /**
     * @param string $group
     * @param string|null $id
     * @return string
     */
    public function display(mixed $group, ?string $id = null): string
    {
        $group = (string) $group;
        /** @var ContentConfig $content */
        $content = $this->container['content'];

        /** @var Config $config */
        $config = $this->container['config'];

        /** @var Config $defaults */
        $defaults = $this->container['defaults'];

        $outline = $this->params['outline'];
        $blueprints = $content->getBlueprintForm("{$group}/{$id}");
        $prefix = "content.{$group}.{$id}";

        if($outline === 'default') {
            $this->params['overrideable'] = false;
        } else {
            $this->params['defaults'] = $defaults->get($prefix);
            $this->params['overrideable'] = true;
        }

        $this->params += [
            'particle' => $blueprints,
            'data' =>  $config->get($prefix),
            'id' => "{$group}.{$id}", // FIXME?
            'parent' => "configurations/{$outline}/content",
            'route'  => "configurations.{$outline}.content.{$prefix}",
            'skip' => ['enabled']
            ];

        return $this->render('@genesis-admin/pages/configurations/content/item.html.twig', $this->params);
    }

    /**
     * @param string $group
     * @param string $id
     * @return string
     */
    public function formfield(string $group, string $id, string ...$segments): string|JsonResponse
    {
        $path = [$group, $id, ...$segments];

        if (end($path) === 'validate') {
            return call_user_func_array([$this, 'validate'], $path);
        }

        /** @var ContentConfig $content */
        $content = $this->container['content'];

        // Load blueprints.
        $blueprints = $content->getBlueprintForm("{$group}/{$id}");

        list($fields, $path, $value) = $blueprints->resolve(array_slice($path, 1), '/');

        if (!$fields) {
            throw new \RuntimeException('Page Not Found', 404);
        }

        /** @var Config $config */
        $config = $this->container['config'];

        $data = $this->request->post->getJsonArray('data');

        $offset = "content.{$group}.{$id}." . implode('.', $path);
        if ($value !== null) {
            $parent = $fields;
            $fields = ['fields' => $fields['fields']];
            $offset .= '.' . $value;
            $data = $data ?: $config->get($offset);
            $data = ['data' => $data];
            $prefix = 'data.';
        } else {
            $parent = null;
            $data = $data ?: $config->get($offset);
            $prefix = 'data';
        }

        $fields['is_current'] = true;

        array_pop($path);

        $outline = $this->params['outline'];
        $configuration = "configurations/{$outline}";
        $this->params = [
                'configuration' => $configuration,
                'blueprints' => $fields,
                'data' => $data,
                'prefix' => $prefix,
                'parent' => $path
                    ? "$configuration/content/content/{$group}/{$id}/" . implode('/', $path)
                    : "$configuration/content/content/{$group}/{$id}",
                'route' => 'content.' . $offset
            ] + $this->params;

        if (isset($parent['key'])) {
            $this->params['key'] = $parent['key'];
        }
        if (isset($parent['value'])) {
            $this->params['title'] = $parent['value'];
        }

        return $this->render('@genesis-admin/pages/configurations/content/field.html.twig', $this->params);
    }

    /**
     * @param string $group
     * @param string $id
     * @return JsonResponse
     */
    public function validate(string $group, string $id, string ...$segments): JsonResponse
    {
        $path = implode('.', array_slice([$group, $id, ...$segments], 1, -2));

        // Validate only exists for JSON.
        if (empty($this->params['ajax'])) {
            $this->undefined();
        }

        /** @var ContentConfig $content */
        $content = $this->container['content'];

        // Load blueprints.
        $validator = $content->get("{$group}/{$id}");

        // Create configuration from the defaults.
        $data = new Config(
            [],
            static function () use ($validator): array {
                return $validator;
            }
        );

        $data->join($path, $this->request->post->getArray('data'));

        // TODO: validate

        return new JsonResponse(['data' => $data->get($path)]);
    }

    /**
     * @param null $group
     * @param null $id
     * @return string
     */
    public function save(?string $group = null, ?string $id = null): string
    {
        $data = $id ? [$group => [$id => $this->request->post->getArray()]] : $this->request->post->getArray('content');

        foreach ($data as $groupName => $subgroups) {
            foreach ($subgroups as $name => $values) {
                $this->saveItem($groupName, $name, $values);
            }
        }

        // Fire save event.
        $event = new Event;
        $event->genesis = $this->container;
        $event->theme = $this->container['theme'];
        $event->controller = $this;
        $event->data = $data;
        $this->container->fireEvent('admin.content.save', $event);

        return $id ? $this->display($group, $id) : $this->index();
    }

    /**
     * @param string $group
     * @param string $id
     * @param array|null $data
     */
    protected function saveItem(string $group, string $id, ?array $data): void
    {
        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        // Save layout into custom directory for the current theme.
        $outline = $this->params['outline'];
        $save_dir = $locator->findResource("genesis-config://{$outline}/content", true, true);
        $filename = "{$save_dir}/{$group}/{$id}.yaml";

        $file = YamlFile::instance($filename);
        if (!is_array($data)) {
            if ($file->exists()) {
                $file->delete();
            }
        } else {
            /** @var ContentConfig $content */
            $content = $this->container['content'];

            $blueprints = $content->getBlueprintForm("{$group}/{$id}");
            $config = new Config($data, static function() use ($blueprints): BlueprintForm { return $blueprints; });

            $file->save($config->toArray());
        }
        $file->free();
    }

    /**
     * @param string $group
     * @param string $id
     * @return string
     */
    public function reset(string $group, string $id): string
    {
        $this->params += [
            'data' => [],
        ];

        return $this->display($group, $id);
    }
}
