<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Genesis\Component\Content\Block\HtmlBlock;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Debugger;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

// Detect Genesis Framework or fail gracefully.
if (!class_exists('Genesis\Framework\Genesis')) {
    $app = Factory::getApplication();
    $app->enqueueMessage(
        Text::sprintf('MOD_GENESIS_PARTICLE_NOT_INITIALIZED', Text::_('MOD_GENESIS_PARTICLE')),
        'warning'
    );
    return;
}

include_once __DIR__ . '/helper.php';

/** @var object $params */
/** @var object $module */

$genesis = Genesis::instance();

if (\GENESIS_DEBUGGER) {
    Debugger::startTimer("module-{$module->id}", "Rendering Particle Module #{$module->id}");
}

// Set up caching.
$cacheid = md5($module->id);

$cacheparams = (object) [
    'cachemode'    => 'id',
    'class'        => 'ModGenesisParticleHelper',
    'method'       => 'cache',
    'methodparams' => [$module, $params],
    'modeparams'   => $cacheid
];

/** @var HtmlBlock $block */
$block = ModGenesisParticleHelper::moduleCache($module, $params, $cacheparams);
if (null === $block) {
    $block = ModGenesisParticleHelper::render($module, $params);
}

/** @var Document $document */
$document = $genesis['document'];
$document->addBlock($block);

echo $block->toString();

if (\GENESIS_DEBUGGER) {
    Debugger::stopTimer("module-{$module->id}");
}
