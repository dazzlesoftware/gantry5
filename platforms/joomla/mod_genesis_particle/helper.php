<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Genesis\Component\Content\Block\ContentBlockInterface;
use Genesis\Component\Content\Block\HtmlBlock;
use Genesis\Debugger;
use Genesis\Framework\Genesis;
use Genesis\Framework\Platform;
use Genesis\Framework\Theme;
use Genesis\Joomla\EventDispatcher;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\Language\Text;
use Joomla\Registry\Registry;

/**
 * Class ModGenesisParticleHelper
 */
class ModGenesisParticleHelper
{
    /**
     * Serve module AJAX requests in 'index.php?option=com_ajax&module=genesis_particle&format=json'.
     *
     * @return array|null|string
     */
    public static function getAjax()
    {
        /** @var CMSApplication $app */
        $app = Factory::getApplication();

        $input = $app->input;
        $format = strtolower($input->getCmd('format', 'html'));
        $id = $input->getInt('id');

        $props = $_GET;
        unset($props['option'], $props['module'], $props['format'], $props['id']);

        return static::ajax($id, $props, $format);
    }

    /**
     * @param $id
     * @param array $props
     * @param string $format
     * @return array|null|string
     */
    public static function ajax($id, $props = [], $format = 'raw')
    {
        if (!in_array($format, ['json', 'raw', 'debug'])) {
            throw new \RuntimeException(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
        }

        $genesis = Genesis::instance();

        /** @var Platform $platform */
        $platform = $genesis['platform'];
        $module = $platform->getModule($id);

        // Make sure that module really exists.
        if (!is_object($module) || strpos($module->module, 'genesis') === false) {
            throw new \RuntimeException(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
        }

        $attribs = ['style' => 'genesis'];

        /** @var CMSApplication $app */
        $app = Factory::getApplication();
        // Trigger the onRenderModule event.
        if ($app->get('dispatcher')) {
            EventDispatcher::dispatch($app, 'onRenderModule', ['subject' => $module, 'attributes' => $attribs]);
        }

        $params = new Registry($module->params);
        $params->set('ajax', $props);
        $block = static::render($module, $params);
        $data = json_decode($params->get('particle'), true);
        $type = $data['type'] . '.' . $data['particle'];
        $identifier = static::getIdentifier($data['particle'], $module->id);
        $html = (string) $block;

        if ($format === 'raw') {
            return $html;
        }

        return ['code' => 200, 'type' => $type, 'id' => $identifier, 'props' => (object) $props, 'html' => $html];
    }

    /**
     * @param object $module
     * @param object $params
     * @return ContentBlockInterface
     */
    public static function render($module, $params)
    {
        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage("Particle Module #{$module->id} was not cached");
        }

        $data = json_decode($params->get('particle'), true);
        $type = $data['type'];
        $particle = $data['particle'];

        $genesis = Genesis::instance();
        if ($genesis->debug()) {
            $enabled_outline = $genesis['config']->get("particles.{$particle}.enabled", true);
            $enabled = isset($data['options']['particle']['enabled']) ? $data['options']['particle']['enabled'] : true;
            $location = (!$enabled_outline ? 'Outline' : (!$enabled ? 'Module' : null));

            if ($location) {
                $block = HtmlBlock::create();
                $block->setContent(sprintf('<div class="alert alert-error">The Particle has been disabled from the %s and won\'t render.</div>', $location));

                return $block;
            }
        }

        $id = static::getIdentifier($particle, $module->id);
        $object = (object) array(
            'id' => $id,
            'type' => $type,
            'subtype' => $particle,
            'attributes' => $data['options']['particle'],
        );

        $context = array(
            'genesis' => $genesis,
            'inContent' => true,
            'ajax' => $params->get('ajax'),
        );

        /** @var Theme $theme */
        $theme = $genesis['theme'];
        $block = $theme->getContent($object, $context);

        // Create outer block with the particle ID for AJAX calls.
        $outer = \Genesis\Component\Content\Block\HtmlBlock::create();
        $outer->setContent('<div id="' . $id . '-particle" class="g-particle">' . $block->getToken() . '</div>');
        $outer->addBlock($block);

        return $outer;
    }

    /**
     * @param $module
     * @param $params
     * @return array
     */
    public static function cache($module, $params)
    {
        return static::render($module, $params)->toArray();
    }

    /**
     * @param $module
     * @param $params
     * @param $cacheparams
     * @return ContentBlockInterface|null
     */
    public static function moduleCache($module, $params, $cacheparams)
    {
        $block = (array) ModuleHelper::moduleCache($module, $params, $cacheparams);
        try {
            return $block ? HtmlBlock::fromArray($block) : null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * @param string $particle
     * @param string $id
     * @return string
     */
    public static function getIdentifier($particle, $id)
    {
        return "module-{$particle}-{$id}";
    }
}
