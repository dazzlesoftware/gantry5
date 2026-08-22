<?php
declare(strict_types=1);

// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_rmdir

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html\Configurations;

use Genesis\Admin\Events\SettingsEvent;
use Genesis\Admin\Particles;
use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Config\Config;
use Genesis\Component\Response\JsonResponse;
use Genesis\Framework\Services\ConfigServiceProvider;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Settings
 * @package Genesis\Admin\Controller\Html\Configurations
 */
class Settings extends HtmlController
{
    protected array $httpVerbs = [
        'GET' => [
            '/'                 => 'index',
            '/particles'        => 'undefined',
            '/particles/*'      => 'display',
            '/particles/*/**'   => 'formfield',
        ],
        'POST' => [
            '/'                 => 'save',
            '/particles'        => 'forbidden',
            '/particles/*'      => 'save',
            '/particles/*/**'   => 'formfield'
        ],
        'PUT' => [
            '/'            => 'save',
            '/particles'   => 'forbidden',
            '/particles/*' => 'save'
        ],
        'PATCH' => [
            '/'            => 'save',
            '/particles'   => 'forbidden',
            '/particles/*' => 'save'
        ],
        'DELETE' => [
            '/'            => 'forbidden',
            '/particles'   => 'forbidden',
            '/particles/*' => 'reset'
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
            $this->params['defaults'] = $this->container['defaults'];
            $data = ConfigServiceProvider::load($this->container, $outline, false, false);
        }

        /** @var Particles $particles */
        $particles = $this->container['particles'];
        $this->params += [
            'data' => $data,
            'particles' => $particles->group(['atom']),
            'route'  => "configurations.{$outline}.settings",
            'page_id' => $outline
        ];

        return $this->render('@genesis-admin/pages/configurations/settings/settings.html.twig', $this->params);
    }

    /**
     * @param string $id
     * @return string
     */
    public function display(mixed $id): string
    {
        $id = (string) $id;
        $outline = (string) $this->params['outline'];

        /** @var Particles $particles */
        $particles = $this->container['particles'];

        $blueprints = $particles->getBlueprintForm($id);
        $prefix = 'particles.' . $id;

        if($outline === 'default') {
            $this->params['overrideable'] = false;
            $data = $this->container['config'];
        } else {
            $this->params['overrideable'] = true;
            $this->params['defaults'] = $this->container['defaults']->get($prefix);
            $data = ConfigServiceProvider::load($this->container, $outline, false, false);
        }

        $this->params += [
            'scope' => 'particle.',
            'particle' => $blueprints,
            'data' =>  ['particle' => $data->get($prefix)],
            'id' => $id,
            'parent' => "configurations/{$outline}/settings",
            'route'  => "configurations.{$outline}.settings.{$prefix}",
            'skip' => ['enabled']
            ];

        return $this->render('@genesis-admin/pages/configurations/settings/item.html.twig', $this->params);
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

        /** @var Particles $particles */
        $particles = $this->container['particles'];

        // Load blueprints.
        $blueprints = $particles->getBlueprintForm($id);

        list($fields, $path, $value) = $blueprints->resolve(array_slice($path, 1), '/');
        if (!$fields) {
            throw new \RuntimeException('Page Not Found', 404);
        }

        $data = $this->request->post->getJsonArray('data');

        /** @var Config $config */
        $config = $this->container['config'];

        $offset = "particles.{$id}." . implode('.', $path);
        if ($value !== null) {
            $parent = $fields;
            $fields = ['fields' => $fields['fields']];
            $offset .= '.' . $value;
            $data = $data ?: $config->get($offset);
            $data = ['data' => $data];
            $scope = 'data.';
        } else {
            $data = $data ?: $config->get($offset);
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
                'scope' => $scope,
                'parent' => $path
                    ? "{$configuration}/settings/particles/{$id}/" . implode('/', $path)
                    : "{$configuration}/settings/particles/{$id}",
                'route' => "configurations.{$outline}.settings.{$offset}",
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

        /** @var Particles $particles */
        $particles = $this->container['particles'];

        // Load particle blueprints.
        $validator = $particles->get($particle);

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
     * @param string|null $id
     * @return string
     */
    public function save(?string $id = null): string
    {
        if (!$this->request->post->get('_end')) {
            throw new \OverflowException("Incomplete data received. Please increase the value of 'max_input_vars' variable (in php.ini or .htaccess)", 400);
        }

        $data = $id ? [$id => $this->request->post->getArray('particle')] : $this->request->post->getArray('particles');

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        // Save layout into custom directory for the current theme.
        $outline = (string) $this->params['outline'];
        $save_dir = $locator->findResource("genesis-config://{$outline}/particles", true, true);
        if (!is_string($save_dir) || $save_dir === '') {
            throw new \RuntimeException('Unable to create the particle configuration folder', 500);
        }

        foreach ($data as $name => $values) {
            $this->saveItem($name, $values, $save_dir);
        }
        @rmdir($save_dir);

        // Fire save event.
        $event = new SettingsEvent();
        $event->genesis = $this->container;
        $event->theme = $this->container['theme'];
        $event->controller = $this;
        $event->data = $data;
        $this->container->fireEvent('admin.settings.save', $event);

        return $id ? $this->display($id) : $this->index();
    }

    /**
     * @param string $id
     * @param array $data
     * @param string $save_dir
     */
    protected function saveItem(string $id, mixed $data, string $save_dir): void
    {
        $filename = "{$save_dir}/{$id}.yaml";

        $file = YamlFile::instance($filename);
        if (!is_array($data)) {
            if ($file->exists()) {
                $file->delete();
            }
        } else {
            /** @var Particles $particles */
            $particles = $this->container['particles'];

            $blueprints = $particles->getBlueprintForm($id);
            $config = new Config($data, static function() use ($blueprints): mixed { return $blueprints; });

            $file->save($config->toArray());
        }
        $file->free();
    }

    /**
     * @param string $id
     * @return string
     */
    public function reset(string $id): string
    {
        $this->params += [
            'data' => [],
        ];

        return $this->display($id);
    }
}
