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
use Timber\Helper;
use Timber\Timber;

/*
 * The template for displaying BBPress pages
 */

$gantry = Gantry::instance();

/** @var Theme $theme */
$theme  = $gantry['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::get_context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$context['posts']   = Timber::query_post();
$context['content'] = Helper::ob_function('the_content');

Timber::render('bbpress.html.twig', $context);
