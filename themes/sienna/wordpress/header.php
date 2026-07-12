<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Gantry\Framework\Gantry;
use Gantry\Framework\Theme;
use Timber\Timber;

/*
 * Third party plugins that hijack the theme will call wp_head() to get the header template.
 * We use this to start our output buffer and render into the views/page-plugin.html.twig template in footer.php
 */

$gantry = Gantry::instance();

/** @var Theme $theme */
$theme  = $gantry['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::get_context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$GLOBALS['timberContext'] = $context;

ob_start();
