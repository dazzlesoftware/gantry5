<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Json;

use Genesis\Component\Admin\JsonController;
use Genesis\Component\Config\BlueprintSchema;
use Genesis\Component\Config\BlueprintForm;
use Genesis\Component\Config\Config;
use Genesis\Component\Response\JsonResponse;

/**
 * Class Particle
 * @package Genesis\Admin\Controller\Json
 */
class Particle extends JsonController
{
    /** @var array */
    protected $httpVerbs = [
        'GET'    => [
            '/'                  => 'selectParticle',
            '/module'            => 'selectModule'
        ],
        'POST'   => [
            '/'                  => 'undefined',
            '/*'                 => 'particle',
            '/*/validate'        => 'validate',
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
     * Return a modal for selecting a particle.
     *
     * @return string
     */
    public function selectParticle()
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

        $this->params['particles'] = $groups;
        return new JsonResponse(['html' => $this->render('@genesis-admin/modals/particle-picker.html.twig', $this->params)]);
    }

    /**
     * Return a modal content for selecting module.
     *
     * @return JsonResponse
     */
    public function selectModule()
    {
        return new JsonResponse(['html' => $this->render('@genesis-admin/modals/module-picker.html.twig', $this->params)]);
    }

    /**
     * Return form for the particle (filled with data coming from POST).
     *
     * @param string $name
     * @return JsonResponse
     */
    public function particle($name)
    {
        $data = $this->request->post['item'];
        if ($data) {
            $data = json_decode($data, true);
        } else {
            $data = $this->request->post->getArray();
        }

        // TODO: add support for other block types as well, like menu.
        // $block = BlueprintForm::instance('layout/block.yaml', 'Genesis-admin://blueprints');
        $blueprints = $this->container['particles']->getBlueprintForm($name);

        // Load particle blueprints and default settings.
        $validator = $this->loadBlueprints('menu');
        $callable = function () use ($validator) {
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
            // 'block'         => $block,
            'data'          => ['particles' => [$name => $item->options['particle']]],
            'particle'      => $blueprints,
            'parent'        => 'settings',
            'prefix'        => "particles.{$name}.",
            'route'         => "configurations.default.settings",
            'action'        => "particle/{$name}/validate"
        ];

        return new JsonResponse(['html' => $this->render('@genesis-admin/modals/particle.html.twig', $this->params)]);
    }

    /**
     * Validate data for the particle.
     *
     * @param string $name
     * @return JsonResponse
     */
    public function validate($name)
    {
        // Load particle blueprints and default settings.
        $validator = new BlueprintSchema;
        $validator->embed('options', $this->container['particles']->get($name));

        $blueprints = $this->container['particles']->getBlueprintForm($name);

        // Create configuration from the defaults.
        $data = new Config([],
            function () use ($validator) {
                return $validator;
            }
        );

        $data->set('type', 'particle');
        $data->set('particle', $name);
        $data->set('title', $this->request->post['title'] ?: $blueprints->get('name'));
        $data->set('options.particle', $this->request->post->getArray("particles.{$name}"));
        $data->def('options.particle.enabled', 1);

        $block = $this->request->post->getArray('block');
        foreach ($block as $key => $param) {
            if ($param === '') {
                unset($block[$key]);
            }
        }

        if ($block) {
            $data->join('options.block', $block);
        }

        // TODO: validate

        // Fill parameters to be passed to the template file.
        $this->params['item'] = (object) $data->toArray();

        return new JsonResponse(['item' => $data->toArray()]);
    }

    /**
     * @return array
     */
    protected function getParticles()
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
     * Load blueprints.
     *
     * @param string $name
     * @return BlueprintForm
     */
    protected function loadBlueprints($name = 'menu')
    {
        return BlueprintForm::instance("menu/{$name}.yaml", 'Genesis-admin://blueprints');
    }
}
