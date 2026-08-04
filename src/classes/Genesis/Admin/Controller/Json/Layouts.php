<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Json;

use Genesis\Component\Admin\JsonController;
use Genesis\Component\Config\BlueprintForm;
use Genesis\Component\Layout\Layout;
use Genesis\Component\Response\JsonResponse;

/**
 * Class Layouts
 * @package Genesis\Admin\Controller\Json
 */
class Layouts extends JsonController
{
    /** @var array */
    protected $httpVerbs = [
        'GET' => [
            '/' => 'index',
            '/*' => 'index',
            '/particle' => 'particle'
        ],
        'POST' => [
            '/' => 'index',
            '/*' => 'index',
            '/particle' => 'particle'
        ]
    ];

    /**
     * @return JsonResponse
     */
    public function index()
    {
        $path = implode('/', func_get_args());

        $post = $this->request->request;

        $outline = $post['outline'];
        $type = $post['type'];
        $subtype = $post['subtype'];
        $inherit = $post['inherit'];
        $clone = $post['mode'] === 'clone';
        $id = $post['id'];

        $this->container['outline'] = $outline;
        $this->container['configuration'] = $outline;

        $layout = Layout::instance($outline);
        if ($inherit) {
            $layout->inheritAll();
        }

        if ($path === 'list' && !$layout->isLayoutType($type)) {
            $instance = $this->getParticleInstances($outline, $subtype, null);
            $id = $instance['selected'];
        }

        $item = $layout->find($id);
        $type = isset($item->type) ? $item->type : $type;
        $subtype = isset($item->subtype) ? $item->subtype : $subtype;
        $item->attributes = isset($item->attributes) ? (array) $item->attributes : [];
        $block = $layout->block($id);
        $block = isset($block->attributes) ? (array) $block->attributes : [];

        $params = [
            'Genesis'        => $this->container,
            'parent'        => 'settings',
            'route'         => "configurations.{$outline}.settings",
            'inherit'       => $inherit ? $outline : null,
        ];

        if ($layout->isLayoutType($type)) {
            $name = $type;
            $particle = false;
            $defaults = [];
            $blueprints = BlueprintForm::instance("layout/{$name}.yaml", 'Genesis-admin://blueprints');
        } else {
            $name = $subtype;
            $particle = true;
            $defaults = $this->container['config']->get("particles.{$name}");
            $item->attributes = $item->attributes + $defaults;
            $blueprints = $this->container['particles']->getBlueprintForm($name);
            $blueprints->set('form/fields/_inherit', ['type' => 'genesis.inherit']);
        }

        $paramsParticle = [
            'title'         => isset($item->title) ? $item->title : '',
            'blueprints'    => $blueprints->get('form'),
            'item'          => $item,
            'data'          => ['particles' => [$name => $item->attributes]],
            'defaults'      => ['particles' => [$name => $defaults]],
            'prefix'        => "particles.{$name}.",
            'editable'      => $particle,
            'overrideable'  => $particle,
            'skip'          => ['enabled']
        ] + $params;

        $html['g-settings-particle'] = $this->render('@genesis-admin/pages/configurations/layouts/particle-card.html.twig',  $paramsParticle);
        $html['g-settings-block-attributes'] = $this->renderBlockFields($block, $params);
        if ($path === 'list') {
            $html['g-inherit-particle'] = $this->renderParticlesInput($inherit || $clone ? $outline : null, $subtype, $post['selected']);
        }

        return new JsonResponse(['json' => $item, 'html' => $html]);
    }

    /**
     * @return JsonResponse
     */
    public function particle()
    {
        $post = $this->request->request;

        $outline = $post['outline'];
        $id = $post['id'];

        $this->container['outline'] = $outline;
        $this->container['configuration'] = $outline;

        $layout = Layout::instance($outline);

        /** @var \stdClass $particle */
        $particle = clone $layout->find($id);
        if (!isset($particle->type)) {
            throw new \RuntimeException('Particle was not found from the outline', 404);
        }

        $particle->block = $layout->block($id);

        $name = $particle->subtype;
        $prefix = "particles.{$name}";
        $defaults = (array) $this->container['config']->get($prefix);
        $attributes = (array) $particle->attributes + $defaults;

        $particleBlueprints = $this->container['particles']->getBlueprintForm($name);
        $particleBlueprints->set('form/fields/_inherit', ['type' => 'genesis.inherit']);

        $blockBlueprints = BlueprintForm::instance('layout/block.yaml', 'Genesis-admin://blueprints');

        // TODO: Use blueprints to merge configuration.
        $particle->attributes = (object) $attributes;

        $this->params['id'] = $name;
        $this->params += [
            'extra'         => $blockBlueprints,
            'item'          => $particle,
            'data'          => ['particles' => [$name => $attributes]],
            'defaults'      => ['particles' => [$name => $defaults]],
            'prefix'        => "particles.{$name}.",
            'particle'      => $particleBlueprints,
            'parent'        => 'settings',
            'route'         => "configurations.{$outline}.settings",
            'action'        => str_replace('.', '/', 'configurations.' . $outline . '.layout.' . $prefix . '.validate'),
            'skip'          => ['enabled'],
            'editable'      => false,
            'overrideable'  => true,
        ];

        $html = $this->render('@genesis-admin/pages/configurations/layouts/particle-preview.html.twig', $this->params);

        return new JsonResponse(['html' => $html]);
    }

    /**
     * Render block settings.
     *
     * @param array $block
     * @param array $params
     * @return string
     */
     protected function renderBlockFields(array $block, array $params)
     {
         $blockBlueprints = BlueprintForm::instance('layout/block.yaml', 'Genesis-admin://blueprints');

         $paramsBlock = [
                 'title' => $this->container['translator']->translate('GENESIS_PLATFORM_BLOCK'),
                 'blueprints' => ['fields' => $blockBlueprints->get('form/fields/block_container/fields')],
                 'data' => ['block' => $block],
                 'prefix' => 'block.',
             ] + $params;

         return $this->render('@genesis-admin/forms/fields.html.twig',  $paramsBlock);
     }

    /**
     * Gets the list of available particle instances for an outline
     *
     * @param string $outline
     * @param string $particle
     * @param string|null $selected
     * @return array
     */
    protected function getParticleInstances($outline, $particle, $selected)
    {
        $list = $outline ? $this->container['outlines']->getParticleInstances($outline, $particle, false) : [];
        $selected = $selected && isset($list[$selected]) ? $selected : (string)key($list);

        return ['list' => $list, 'selected' => $selected];
    }

    /**
     * Render input field for particle picker.
     *
     * @param string $outline
     * @param string $particle
     * @param string $selected
     * @return string
     */
    protected function renderParticlesInput($outline, $particle, $selected)
    {
        $instances = $this->getParticleInstances($outline, $particle, $selected);

        $params = [
            'layout' => 'input',
            'scope' => 'inherit.',
            'field' => [
                'name' => 'particle',
                'type' => 'genesis.particles',
                'id' => 'g-inherit-particle',
                'outline' => $outline,
                'particles' => $instances['list'],
                'particle' => $particle
            ],
            'value' => $instances['selected']
        ];

        return $this->render('@genesis-admin/forms/fields/genesis/particles.html.twig', $params);
    }
}
