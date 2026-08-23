<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Timber\Timber;

/*
 * The template to display when page is offline
 */

$genesis = Genesis::instance();

/** @var Theme $theme */
$theme  = $genesis['theme'];
$theme->setLayout('_offline', true);

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

Timber::render('offline.html.twig', $context);
